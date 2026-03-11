from __future__ import annotations

from .cn_market_utils import dataframe_to_standard_string, rename_columns
from .vendor_errors import VendorDataEmptyError, VendorRetryableError


OHLCV_RENAME_MAP = {
    "日期": "Date",
    "开盘": "Open",
    "收盘": "Close",
    "最高": "High",
    "最低": "Low",
    "成交量": "Volume",
    "成交额": "Amount",
    "振幅": "Amplitude",
    "涨跌幅": "ChangePercent",
    "涨跌额": "Change",
    "换手率": "TurnoverRate",
}


def _import_akshare():
    try:
        import akshare as ak
    except ModuleNotFoundError as exc:
        raise VendorRetryableError("akshare is not installed.") from exc
    return ak


def _fetch_akshare_stock_df(symbol: str, start_date: str, end_date: str):
    ak = _import_akshare()
    try:
        df = ak.stock_zh_a_hist(
            symbol=symbol,
            period="daily",
            start_date=start_date.replace("-", ""),
            end_date=end_date.replace("-", ""),
            adjust="qfq",
        )
    except Exception as exc:
        raise VendorRetryableError(f"akshare stock fetch failed: {exc}") from exc

    if df is None or df.empty:
        raise VendorDataEmptyError(f"No akshare stock data found for {symbol}")

    return rename_columns(df, OHLCV_RENAME_MAP)


def get_stock(symbol: str, start_date: str, end_date: str) -> str:
    df = _fetch_akshare_stock_df(symbol, start_date, end_date)
    title = f"CN stock data for {symbol} from {start_date} to {end_date}"
    return dataframe_to_standard_string(df, title)
