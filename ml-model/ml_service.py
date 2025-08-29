from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import pandas as pd
from collections import deque

# Load trained model
model = joblib.load("model.pkl")

class Candle(BaseModel):
    open: float
    high: float
    low: float
    close: float
    volume: float

app = FastAPI()

# Rolling history of last 20 candles
history = deque(maxlen=20)

def compute_features(df: pd.DataFrame):
    df['returns'] = df['close'].pct_change()
    df['volatility'] = df['returns'].rolling(window=5).std()
    df['sma_5'] = df['close'].rolling(window=5).mean()
    df['sma_10'] = df['close'].rolling(window=10).mean()
    df['ema_10'] = df['close'].ewm(span=10, adjust=False).mean()

    delta = df['close'].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain).rolling(window=14).mean()
    avg_loss = pd.Series(loss).rolling(window=14).mean()
    rs = avg_gain / (avg_loss + 1e-10)
    df['rsi_14'] = 100 - (100 / (1 + rs))

    df['bb_middle'] = df['close'].rolling(window=20).mean()
    df['bb_upper'] = df['bb_middle'] + 2 * df['close'].rolling(window=20).std()
    df['bb_lower'] = df['bb_middle'] - 2 * df['close'].rolling(window=20).std()

    df['volume_mean_5'] = df['volume'].rolling(window=5).mean()
    df['rel_volume'] = df['volume'] / (df['volume_mean_5'] + 1e-10)

    latest = df.iloc[-1]
    feature_vector = [
        latest['open'], latest['high'], latest['low'], latest['close'], latest['volume'],
        latest['returns'], latest['volatility'], latest['sma_5'], latest['sma_10'], latest['ema_10'],
        latest['rsi_14'], latest['bb_middle'], latest['bb_upper'], latest['bb_lower'], latest['rel_volume']
    ]
    return np.array([feature_vector])

@app.post("/predict")
def predict(candle: Candle):
    # Append new candle to history
    history.append(candle.__dict__)
    if len(history) < 20:
        return {"error": f"Need at least 20 candles. Current: {len(history)}"}

    df = pd.DataFrame(list(history))
    X_new = compute_features(df)
    prediction = model.predict(X_new)[0]
    return {"prediction": int(prediction)}