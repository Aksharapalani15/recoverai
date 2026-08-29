"""
RecoverAI ML Pipeline
======================
This module reorganizes the modeling logic that already existed in
`day1_data_analysis.ipynb` into reusable, importable functions so a real
API layer can serve it. The modeling approach (Random Forest classifier,
feature set, priority thresholds, and the failure-reason -> action/channel
rule engine) is unchanged from the notebook -- it has just been moved out
of notebook cell state and made persistent (trained once, saved to disk).

Pipeline stages (matches the README):
  Transaction Dataset -> preprocessing -> Random Forest model
  -> recovery_probability -> priority -> recommended_action
  -> recommended_channel -> (Gemini explanation happens in gemini_service.py)
"""

from __future__ import annotations

import json
import threading
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "transactions.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
PREDICTIONS_PATH = ARTIFACTS_DIR / "predictions.csv"
METRICS_PATH = ARTIFACTS_DIR / "metrics.json"

CATEGORICAL_COLS = ["payment_method", "merchant_category", "failure_reason"]
DROP_COLS = ["transaction_id", "customer_id", "recovered", "recovery_amount"]

# Guards against two threads training/writing artifacts at the same time
# (see the lifespan startup fix in main.py for the primary fix -- this is
# defense in depth so this function is safe to call concurrently on its own).
_train_lock = threading.Lock()


def _build_pipeline() -> Pipeline:
    """Same model family/config chosen in the notebook (Random Forest beat
    Logistic Regression on F1/ROC-AUC during the notebook's model comparison)."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_COLS),
        ],
        remainder="passthrough",
    )
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        class_weight="balanced",
    )
    return Pipeline([("preprocessor", preprocessor), ("model", model)])


def _recovery_strategy(probability: float, reason: str) -> tuple[str, str]:
    """Failure-reason -> recommended action/channel rule engine.
    Ported as-is from the notebook's recovery_strategy() function."""
    if reason == "Network Error":
        return "Retry payment", "Automatic retry"
    if reason == "Timeout":
        return "Retry payment after short delay", "Automatic retry"
    if reason == "Authentication Failed":
        return "Request customer authentication", "Customer notification"
    if reason == "Insufficient Balance":
        return "Ask customer to add funds or use another method", "Customer notification"
    if reason == "Bank Declined":
        return "Suggest alternative payment method", "Customer notification"
    return "Review transaction", "Manual review"


def _priority_from_probability(probability: float) -> str:
    if probability >= 0.80:
        return "VERY HIGH"
    if probability >= 0.60:
        return "HIGH"
    if probability >= 0.30:
        return "MEDIUM"
    return "LOW"


def train_and_predict(force: bool = False) -> pd.DataFrame:
    """Trains the model (if not already trained) and produces predictions
    for every transaction in the dataset. Results are cached to disk so the
    API doesn't retrain on every request.

    Note: for this dataset size (5k rows, demo/hackathon context) we report
    held-out metrics from an 80/20 split, then fit the final model on the
    full dataset so every transaction in the dashboard gets a prediction.
    This is a reasonable choice for a demo dashboard, not a production
    training regimen -- flagging that honestly rather than hiding it.
    """
    if not force and PREDICTIONS_PATH.exists() and MODEL_PATH.exists():
        return pd.read_csv(PREDICTIONS_PATH)

    with _train_lock:
        # Re-check inside the lock: another thread may have finished
        # training while we were waiting for it.
        if not force and PREDICTIONS_PATH.exists() and MODEL_PATH.exists():
            return pd.read_csv(PREDICTIONS_PATH)
        return _train_and_predict_locked()


def _train_and_predict_locked() -> pd.DataFrame:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(DATA_PATH)

    X = df.drop(columns=DROP_COLS)
    y = df["recovered"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    eval_pipeline = _build_pipeline()
    eval_pipeline.fit(X_train, y_train)
    y_pred = eval_pipeline.predict(X_test)
    y_prob = eval_pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1": round(float(f1_score(y_test, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "note": (
            "Metrics computed on a held-out 20% test split. The deployed "
            "model below is refit on the full dataset so every transaction "
            "gets a prediction for the dashboard."
        ),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))

    final_pipeline = _build_pipeline()
    final_pipeline.fit(X, y)
    joblib.dump(final_pipeline, MODEL_PATH)

    recovery_probability = final_pipeline.predict_proba(X)[:, 1]

    results = df.copy()
    results["recovery_probability"] = recovery_probability
    results["priority"] = results["recovery_probability"].apply(_priority_from_probability)

    actions_channels = results.apply(
        lambda row: _recovery_strategy(row["recovery_probability"], row["failure_reason"]),
        axis=1,
        result_type="expand",
    )
    results["recommended_action"] = actions_channels[0]
    results["recommended_channel"] = actions_channels[1]
    results["actual_recovered"] = results["recovered"]

    results = results.sort_values("recovery_probability", ascending=False).reset_index(drop=True)
    results.to_csv(PREDICTIONS_PATH, index=False)
    return results


def get_metrics() -> dict:
    if METRICS_PATH.exists():
        return json.loads(METRICS_PATH.read_text())
    return {}
