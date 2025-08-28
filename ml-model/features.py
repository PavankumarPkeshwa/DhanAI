import numpy as np
import pandas as pd

def compute_features(df: pd.DataFrame):
    # df must have: time, open, high, low, close, volume
    if len(df) < 20:
        return None

    df['return1'] = df['close'].pct_change()
    df['sma5'] = df['close'].rolling(5).mean()
    df['sma10'] = df['close'].rolling(10).mean()
    df['vol20'] = df['volume'].rolling(20).mean()

    latest = df.iloc[-1]
    return np.array([latest['return1'], latest['sma5'], latest['sma10'], latest['vol20']])
