from __future__ import annotations

import traceback
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.gemini_service import gemini_configured, get_ai_insight
from app.pipeline import get_metrics, train_and_predict

_df_cache: Optional[pd.DataFrame] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train (or load cached artifacts) ONCE, synchronously, before the server
    # accepts any requests. This is the fix for a real bug: the previous
    # lazy "train on first request" approach let multiple concurrent requests
    # (health/kpis/charts all fire together on page load) each see an empty
    # cache and start training + writing model.joblib/predictions.csv at the
    # same time. On Windows this throws PermissionError ("file is being used
    # by another process") because file locking is stricter than on Linux --
    # that's what was causing "Dashboard unavailable" / "Analytics
    # unavailable" right after starting the backend fresh.
    global _df_cache
    print("[startup] Training/loading RecoverAI model...")
    _df_cache = train_and_predict()
    print(f"[startup] Ready. {len(_df_cache)} transactions scored.")
    yield


app = FastAPI(title="RecoverAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only -- restrict this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Without this, any unexpected error becomes a bare "Internal Server
    # Error" with no detail, so the frontend has nothing useful to show.
    # This surfaces the real exception message and type in the response
    # body (and the full traceback in the backend terminal) so a failure is
    # actually diagnosable instead of just "unavailable".
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"{type(exc).__name__}: {exc}",
        },
    )


def get_df() -> pd.DataFrame:
    global _df_cache
    if _df_cache is None:
        # Should not happen (lifespan sets this before requests are served),
        # but fall back safely rather than crash if it's ever hit.
        _df_cache = train_and_predict()
    return _df_cache


def clean_records(df: pd.DataFrame) -> list[dict]:
    return df.replace({np.nan: None}).to_dict(orient="records")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "ai_system_online": True,
        "gemini_configured": gemini_configured(),
    }


@app.get("/api/kpis")
def kpis():
    df = get_df()
    total_failed = len(df)
    recovery_rate = float(df["actual_recovered"].mean()) if total_failed else 0.0
    recoverable_amount = float(
        df.loc[df["recovery_probability"] >= 0.60, "amount"].sum()
    )
    high_priority_count = int(df["priority"].isin(["HIGH", "VERY HIGH"]).sum())

    return {
        "total_failed_payments": total_failed,
        "recovery_rate": round(recovery_rate * 100, 2),
        "recoverable_amount": round(recoverable_amount, 2),
        "high_priority_transactions": high_priority_count,
        "total_amount_at_risk": round(float(df["amount"].sum()), 2),
    }


@app.get("/api/analytics/charts")
def charts():
    df = get_df()

    prob_bins = pd.cut(
        df["recovery_probability"],
        bins=[0, 0.2, 0.4, 0.6, 0.8, 1.0],
        labels=["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"],
        include_lowest=True,
    )
    probability_distribution = (
        prob_bins.value_counts().sort_index().rename_axis("bucket").reset_index(name="count")
    ).to_dict(orient="records")

    by_payment_method = (
        df.groupby("payment_method")
        .agg(count=("transaction_id", "count"), recovery_rate=("actual_recovered", "mean"))
        .reset_index()
    )
    by_payment_method["recovery_rate"] = (by_payment_method["recovery_rate"] * 100).round(2)
    by_payment_method = by_payment_method.to_dict(orient="records")

    by_failure_reason = (
        df.groupby("failure_reason")
        .agg(count=("transaction_id", "count"), amount_at_risk=("amount", "sum"))
        .reset_index()
        .sort_values("count", ascending=False)
    )
    by_failure_reason["amount_at_risk"] = by_failure_reason["amount_at_risk"].round(2)
    by_failure_reason = by_failure_reason.to_dict(orient="records")

    priority_distribution = (
        df["priority"].value_counts().reindex(["VERY HIGH", "HIGH", "MEDIUM", "LOW"]).fillna(0)
    )
    priority_distribution = (
        priority_distribution.rename_axis("priority").reset_index(name="count")
    ).to_dict(orient="records")

    by_merchant_category = (
        df.groupby("merchant_category")
        .agg(count=("transaction_id", "count"), recovery_rate=("actual_recovered", "mean"))
        .reset_index()
    )
    by_merchant_category["recovery_rate"] = (by_merchant_category["recovery_rate"] * 100).round(2)
    by_merchant_category = by_merchant_category.to_dict(orient="records")

    recovered_vs_not = (
        df["actual_recovered"]
        .map({1: "Recovered", 0: "Not Recovered"})
        .value_counts()
        .rename_axis("status")
        .reset_index(name="count")
    ).to_dict(orient="records")

    return {
        "probability_distribution": probability_distribution,
        "recovery_by_payment_method": by_payment_method,
        "failures_by_reason": by_failure_reason,
        "priority_distribution": priority_distribution,
        "recovery_by_merchant_category": by_merchant_category,
        "recovered_vs_not": recovered_vs_not,
    }


@app.get("/api/model/metrics")
def model_metrics():
    return get_metrics()


@app.get("/api/transactions")
def list_transactions(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    payment_method: Optional[str] = None,
    failure_reason: Optional[str] = None,
    sort_by: str = "recovery_probability",
    order: str = "desc",
    page: int = 1,
    page_size: int = 25,
):
    df = get_df().copy()

    if search:
        s = search.lower()
        df = df[
            df["transaction_id"].str.lower().str.contains(s)
            | df["customer_id"].str.lower().str.contains(s)
        ]
    if priority:
        df = df[df["priority"] == priority]
    if payment_method:
        df = df[df["payment_method"] == payment_method]
    if failure_reason:
        df = df[df["failure_reason"] == failure_reason]

    if sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=(order == "asc"))

    total = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": clean_records(page_df),
    }


@app.get("/api/transactions/filters")
def transaction_filters():
    df = get_df()
    return {
        "priorities": ["VERY HIGH", "HIGH", "MEDIUM", "LOW"],
        "payment_methods": sorted(df["payment_method"].unique().tolist()),
        "failure_reasons": sorted(df["failure_reason"].unique().tolist()),
    }


@app.get("/api/transactions/{transaction_id}")
def get_transaction(transaction_id: str):
    df = get_df()
    row = df[df["transaction_id"] == transaction_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return clean_records(row)[0]


@app.post("/api/transactions/{transaction_id}/ai-insight")
def ai_insight(transaction_id: str, refresh: bool = False):
    df = get_df()
    row = df[df["transaction_id"] == transaction_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Transaction not found")
    record = clean_records(row)[0]
    insight = get_ai_insight(transaction_id, record, refresh=refresh)
    return insight
