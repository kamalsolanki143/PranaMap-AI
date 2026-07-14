"""Custom metric functions for air quality model evaluation.

Implements MAE, RMSE, R-squared, and MAPE with domain-specific variants
for AQI prediction tasks.
"""

import numpy as np


def mean_absolute_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Mean Absolute Error.

    Args:
        y_true: Ground truth values.
        y_pred: Predicted values.

    Returns:
        MAE score (lower is better).
    """
    return float(np.mean(np.abs(y_true - y_pred)))


def root_mean_squared_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Root Mean Squared Error.

    Args:
        y_true: Ground truth values.
        y_pred: Predicted values.

    Returns:
        RMSE score (lower is better).
    """
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def r_squared(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute R-squared (coefficient of determination).

    Args:
        y_true: Ground truth values.
        y_pred: Predicted values.

    Returns:
        R-squared score (1.0 is perfect).
    """
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    if ss_tot == 0:
        return 0.0
    return float(1.0 - (ss_res / ss_tot))


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute Mean Absolute Percentage Error.

    Args:
        y_true: Ground truth values (must not contain zeros).
        y_pred: Predicted values.

    Returns:
        MAPE score as a percentage (lower is better).
    """
    mask = y_true != 0
    if not np.any(mask):
        return float("inf")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def aqi_category_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute accuracy of AQI category prediction.

    Categories: Good (0-50), Moderate (51-100), Unhealthy-SG (101-150),
    Unhealthy (151-200), Very Unhealthy (201-300), Hazardous (301+).

    Args:
        y_true: Ground truth AQI values.
        y_pred: Predicted AQI values.

    Returns:
        Fraction of predictions in the same category as ground truth.
    """
    bins = [0, 50, 100, 150, 200, 300, 500]
    true_cats = np.digitize(y_true, bins)
    pred_cats = np.digitize(y_pred, bins)
    return float(np.mean(true_cats == pred_cats))


def compute_all_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
    """Compute all evaluation metrics and return as a dictionary.

    Args:
        y_true: Ground truth values.
        y_pred: Predicted values.

    Returns:
        Dictionary mapping metric names to their values.
    """
    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": root_mean_squared_error(y_true, y_pred),
        "r2": r_squared(y_true, y_pred),
        "mape": mean_absolute_percentage_error(y_true, y_pred),
        "aqi_category_accuracy": aqi_category_accuracy(y_true, y_pred),
    }


def print_metrics_table(metrics: dict[str, float]) -> None:
    """Print metrics in a formatted table.

    Args:
        metrics: Dictionary of metric name to value.
    """
    print("\n" + "=" * 40)
    print("  Evaluation Metrics")
    print("=" * 40)
    for name, value in metrics.items():
        if name == "mape":
            print(f"  {name:<25s} {value:>10.2f}%")
        elif name == "aqi_category_accuracy":
            print(f"  {name:<25s} {value:>10.1%}")
        else:
            print(f"  {name:<25s} {value:>10.4f}")
    print("=" * 40 + "\n")
