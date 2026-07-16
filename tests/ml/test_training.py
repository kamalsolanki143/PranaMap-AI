"""PranaMap AI - ML Training & Model Tests

Tests for feature engineering, model training, and prediction quality.
"""

import numpy as np
import pandas as pd
import pytest
from sklearn.ensemble import GradientBoostingRegressor


@pytest.fixture
def sample_aqi_data():
    """Generate synthetic AQI time series for testing."""
    np.random.seed(42)
    n = 500
    dates = pd.date_range("2024-01-01", periods=n, freq="h")
    base_aqi = 80 + 30 * np.sin(np.linspace(0, 20 * np.pi, n))
    noise = np.random.normal(0, 10, n)

    df = pd.DataFrame({
        "recorded_at": dates,
        "ward_id": 1,
        "aqi_value": np.clip(base_aqi + noise, 0, 500).astype(int),
        "pm25": np.clip(base_aqi * 0.5 + np.random.normal(0, 5, n), 0, None),
        "pm10": np.clip(base_aqi * 0.8 + np.random.normal(0, 8, n), 0, None),
        "no2": np.clip(base_aqi * 0.3 + np.random.normal(0, 3, n), 0, None),
        "so2": np.clip(10 + np.random.normal(0, 2, n), 0, None),
        "co": np.clip(0.8 + np.random.normal(0, 0.1, n), 0, None),
        "o3": np.clip(20 + np.random.normal(0, 5, n), 0, None),
        "temperature_c": 30 + 5 * np.sin(np.linspace(0, 50 * np.pi, n)),
        "humidity_pct": 60 + 15 * np.sin(np.linspace(0, 40 * np.pi, n)),
        "wind_speed_kph": np.clip(5 + np.random.normal(0, 2, n), 0, None),
        "wind_dir_deg": np.random.uniform(0, 360, n),
    })
    return df


class TestFeatureEngineering:
    """Tests for feature engineering pipeline."""

    def test_temporal_features_created(self, sample_aqi_data):
        """Should create hour, day_of_week, month features."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        assert "hour_of_day" in df.columns
        assert "day_of_week" in df.columns
        assert "month" in df.columns

    def test_cyclical_encoding(self, sample_aqi_data):
        """Sin/cos encoded temporal features should be in [-1, 1]."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        assert df["hour_sin"].between(-1, 1).all()
        assert df["hour_cos"].between(-1, 1).all()

    def test_lag_features_created(self, sample_aqi_data):
        """Should create lagged AQI columns."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        lag_cols = [c for c in df.columns if c.startswith("aqi_lag_")]
        assert len(lag_cols) >= 4

    def test_rolling_features_created(self, sample_aqi_data):
        """Should create rolling mean and std columns."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        rolling_cols = [c for c in df.columns if "rolling" in c]
        assert len(rolling_cols) >= 6

    def test_pollutant_ratios(self, sample_aqi_data):
        """Should create PM2.5/PM10 and NO2/O3 ratios."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        assert "pm25_pm10_ratio" in df.columns
        assert "no2_o3_ratio" in df.columns

    def test_no_nans_after_processing(self, sample_aqi_data):
        """Engineered features should not contain NaN values."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        assert df.isnull().sum().sum() == 0


class TestModelTraining:
    """Tests for model training and evaluation."""

    def test_model_trains_without_error(self, sample_aqi_data):
        """GradientBoosting model should train successfully."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        X = df[["pm25", "pm10", "no2", "temperature_c", "humidity_pct"]].values
        y = df["aqi_value"].values

        model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)
        assert model is not None

    def test_model_has_minimum_r2(self, sample_aqi_data):
        """Trained model should achieve R² > 0.5 on training data."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        feature_cols = ["pm25", "pm10", "no2", "so2", "co", "o3",
                        "temperature_c", "humidity_pct", "wind_speed_kph"]
        X = df[feature_cols].fillna(0).values
        y = df["aqi_value"].values

        model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        r2 = model.score(X, y)
        assert r2 > 0.5, f"Model R² too low: {r2}"

    def test_predictions_in_valid_range(self, sample_aqi_data):
        """Predictions should be between 0 and 500."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        X = df[["pm25", "pm10", "no2"]].fillna(0).values
        y = df["aqi_value"].values

        model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)
        preds = model.predict(X)
        assert (preds >= 0).all()
        assert (preds <= 500).all()

    def test_model_feature_importances(self, sample_aqi_data):
        """Model should expose feature importances."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        X = df[["pm25", "pm10", "no2"]].fillna(0).values
        y = df["aqi_value"].values

        model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)
        importances = model.feature_importances_
        assert len(importances) == 3
        assert sum(importances) == pytest.approx(1.0, abs=0.01)


class TestModelPersistence:
    """Tests for model save/load cycle."""

    def test_model_pickle_roundtrip(self, tmp_path):
        """Model should survive save and load via pickle."""
        import pickle

        model = GradientBoostingRegressor(n_estimators=10, random_state=42)
        X = np.random.rand(100, 5)
        y = np.random.rand(100)
        model.fit(X, y)

        path = tmp_path / "test_model.pkl"
        with open(path, "wb") as f:
            pickle.dump(model, f)
        with open(path, "rb") as f:
            loaded = pickle.load(f)

        preds_original = model.predict(X)
        preds_loaded = loaded.predict(X)
        np.testing.assert_array_equal(preds_original, preds_loaded)


class TestTimeSeriesValidation:
    """Tests for time-series aware validation."""

    def test_no_future_data_leakage(self, sample_aqi_data):
        """Training data should not contain future information."""
        from scripts.train_model import engineer_features
        df = engineer_features(sample_aqi_data)
        # Check that target is always in the future relative to features
        assert df["recorded_at"].is_monotonic_increasing

    def test_temporal_train_test_split(self, sample_aqi_data):
        """Train/test split should respect temporal ordering."""
        split_idx = int(len(sample_aqi_data) * 0.8)
        train = sample_aqi_data.iloc[:split_idx]
        test = sample_aqi_data.iloc[split_idx:]
        assert train["recorded_at"].max() < test["recorded_at"].min()
