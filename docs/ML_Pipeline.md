# PranaMap AI — ML Pipeline

## Overview

The ML pipeline produces 72-hour air quality forecasts and source attribution explanations. It runs end-to-end from raw data ingestion through feature engineering, model training, evaluation, and inference.

```
Raw Data → Preprocessing → Feature Engineering → Training → Evaluation → Model Registry → Inference
```

## Directory Structure

```
ml/
├── datasets/          # Processed training/validation/test splits
├── models/            # Serialized model artifacts (joblib)
├── training/          # Training scripts and hyperparameter configs
├── inference/         # Prediction serving code
└── notebooks/         # EDA and experiment notebooks
```

---

## Data Sources & Features

### Input Features

| Feature Group | Source | Features | Refresh |
|---------------|--------|----------|---------|
| **AQI History** | `aqi_readings` table | Last 24h of PM2.5, PM10, NO₂, SO₂, O₃, CO at each station (rolling means, std devs, lag values) | 15 min |
| **Meteorology** | `weather_data` table | Temperature, humidity, wind speed, wind direction (U/V components), pressure, boundary layer height | 30 min |
| **Satellite** | `satellite_data` table | Sentinel-5P tropospheric NO₂ column, SO₂ column, aerosol index; NASA FIRMS fire count and radiative power | Daily |
| **Temporal** | Derived | Hour of day, day of week, month, is_weekend, is_holiday, season (monsoon/post-monsoon/winter/summer) | Static |
| **Geospatial** | `stations`, `roads`, `industries` | Distance to nearest highway, distance to nearest industry, ward population density | Static |
| **Traffic** | `roads` table | Estimated vehicular emissions based on road class and average daily traffic | Weekly |

### Target Variable

- **AQI** (composite index) or individual pollutant concentrations (µg/m³) depending on the model variant.

---

## Preprocessing

### Steps

1. **Missing Value Imputation**
   - AQI readings: forward-fill up to 2 hours, then linear interpolation.
   - Weather data: linear interpolation for gaps < 6 hours; drop rows with longer gaps.
   - Satellite data: fill missing tiles with spatial nearest-neighbor within 50 km radius.

2. **Outlier Handling**
   - Cap AQI readings at 500 (instrument malfunction threshold).
   - Flag readings where `|ΔAQI| > 100 in 15 min` as suspect; impute from neighboring stations.

3. **Feature Engineering**
   - **Rolling statistics**: 3h, 6h, 12h, 24h rolling mean and standard deviation for each pollutant.
   - **Wind decomposition**: `wind_u = -wind_speed × sin(wind_dir)`, `wind_v = -wind_speed × cos(wind_dir)`.
   - **Pollutant ratios**: PM2.5/PM10 ratio, NO₂/O₃ ratio (photochemical indicators).
   - **Lag features**: AQI at t-1, t-2, t-3, t-6, t-12, t-24 hours.
   - **Satellite band indices**: Normalized difference between NO₂ and aerosol optical depth.

4. **Scaling**
   - StandardScaler (zero mean, unit variance) fitted on training data and applied consistently.

### Preprocessing Module

```python
# data_pipeline/preprocess/engineering.py

def build_feature_matrix(
    station_id: str,
    reference_time: datetime,
    aqi_df: pd.DataFrame,
    weather_df: pd.DataFrame,
    satellite_df: pd.DataFrame,
    lookback_hours: int = 24,
) -> pd.DataFrame:
    """
    Assembles a single-row feature vector for a station at a given time.
    Returns a DataFrame with one row and all engineered features as columns.
    """
    ...
```

---

## Model Architecture

### Forecasting Models

Two gradient-boosted tree models are trained in parallel and ensembled:

| Model | Library | Strengths |
|-------|---------|-----------|
| **XGBoost** | `xgboost` | Robust to missing values, fast training, native categorical support |
| **LightGBM** | `lightgbm` | Lower memory footprint, leaf-wise growth, excellent on large datasets |

**Ensemble strategy**: Simple average of XGBoost and LightGBM predictions. Weighting is optimized on the validation set.

### Training Configuration

```yaml
# ml/training/config.yaml

xgboost:
  objective: "reg:squarederror"
  n_estimators: 1000
  max_depth: 8
  learning_rate: 0.05
  subsample: 0.8
  colsample_bytree: 0.8
  min_child_weight: 5
  reg_alpha: 0.1
  reg_lambda: 1.0
  early_stopping_rounds: 50

lightgbm:
  objective: "regression"
  n_estimators: 1000
  num_leaves: 63
  max_depth: -1
  learning_rate: 0.05
  subsample: 0.8
  colsample_bytree: 0.8
  min_child_samples: 20
  reg_alpha: 0.1
  reg_lambda: 1.0
  early_stopping_rounds: 50

training:
  test_size: 0.15
  validation_size: 0.15
  random_state: 42
  time_series_split: true
  n_splits: 5
```

### Training Script

```python
# ml/training/train.py

import joblib
import lightgbm as lgb
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train_forecast_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    config: dict,
) -> tuple:
    """
    Trains XGBoost and LightGBM models, saves artifacts, returns ensemble weights.
    """
    # XGBoost training with early stopping
    xgb_model = xgb.XGBRegressor(**config["xgboost"])
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=50,
    )

    # LightGBM training with early stopping
    lgb_model = lgb.LGBMRegressor(**config["lightgbm"])
    lgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(50), lgb.log_evaluation(50)],
    )

    # Save artifacts
    joblib.dump(xgb_model, "ml/models/xgb_aqi_v3.joblib")
    joblib.dump(lgb_model, "ml/models/lgb_aqi_v3.joblib")

    return xgb_model, lgb_model
```

---

## Evaluation Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **MAE** | < 15 | Mean Absolute Error in AQI units |
| **RMSE** | < 22 | Root Mean Squared Error |
| **R²** | > 0.88 | Coefficient of determination |
| **MAPE** | < 12% | Mean Absolute Percentage Error |
| **Within-10%** | > 70% | % of predictions within 10% of actual |

### Evaluation by Forecast Horizon

| Horizon | Expected MAE | Notes |
|---------|-------------|-------|
| 1–6h | < 8 | Near-term, heavily influenced by current readings |
| 6–24h | < 15 | Short-term, weather patterns are the main driver |
| 24–48h | < 22 | Medium-term, model uncertainty grows |
| 48–72h | < 30 | Long-term, lower confidence; wider prediction intervals |

---

## Explainability (SHAP)

Every prediction is accompanied by SHAP (SHapley Additive exPlanations) values to decompose which features contributed most to the predicted AQI.

```python
# ml/inference/explain.py

import shap

def compute_shap_values(
    model,
    feature_vector: pd.DataFrame,
    feature_names: list[str],
) -> dict:
    """
    Returns a dict mapping feature name → SHAP value for a single prediction.
    Positive values push AQI higher; negative values push AQI lower.
    """
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(feature_vector)
    return dict(zip(feature_names, shap_vals[0]))
```

### SHAP Output for Attribution

The SHAP values are grouped into source sectors for the attribution endpoint:

| Sector | Features Included |
|--------|-------------------|
| **Vehicular** | traffic_density, road_proximity, NO₂ lag, CO lag |
| **Industrial** | industry_proximity, SO₂ lag, satellite SO₂ column |
| **Construction** | PM10/PM2.5 ratio, construction_zone_flag |
| **Residential** | temperature (heating proxy), hour_of_day, is_weekend |
| **Natural** | wind_speed, wind_direction, satellite_aerosol_index, crop_burning_flag |

---

## Model Versioning & Registry

Models are tracked in the `forecast_models` database table:

| Field | Description |
|-------|-------------|
| `model_id` | Unique identifier, e.g. `xgboost_aqi_v3` |
| `algorithm` | `xgboost`, `lightgbm`, `ensemble` |
| `pollutant` | `aqi`, `pm25`, `pm10`, `no2`, etc. |
| `version` | Semantic version (MAJOR.MINOR.PATCH) |
| `training_date` | Date the model was last trained |
| `metrics` | JSONB blob with MAE, RMSE, R², etc. |
| `artifact_path` | Path to serialized model file |
| `active` | Whether this model is used for live inference |

Only one model per pollutant is marked `active` at a time. Promoting a new version is a one-line database update.

---

## Inference

### Batch Inference (Forecast Agent)

```python
# ml/inference/predict.py

def predict_batch(
    station_ids: list[str],
    reference_time: datetime,
    forecast_horizon: int = 72,
) -> pd.DataFrame:
    """
    Generates forecasts for multiple stations over the given horizon.
    Returns a DataFrame with columns: station_id, target_time, predicted, lower, upper.
    """
    ...
```

### Prediction Intervals

Prediction intervals are computed using quantile regression:

- Lower bound: 10th percentile prediction
- Upper bound: 90th percentile prediction

This gives an 80% confidence band around the point estimate.

---

## Retraining Schedule

| Trigger | Frequency |
|---------|-----------|
| **Scheduled** | Weekly (Sunday 02:00 UTC) |
| **Performance drift** | When 7-day rolling MAE exceeds 120% of baseline |
| **Data drift** | When feature distribution PSI > 0.2 for any top-10 feature |
| **Manual** | Analyst triggers via `/admin/retrain` endpoint |

---

## Dependencies

```
xgboost>=2.0.0
lightgbm>=4.0.0
shap>=0.43.0
scikit-learn>=1.3.0
pandas>=2.1.0
numpy>=1.25.0
joblib>=1.3.0
```
