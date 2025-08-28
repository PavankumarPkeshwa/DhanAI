import joblib
import pandas as pd
from features import compute_features

model = joblib.load("ml/model.pkl")

def decide(prices):
    """
    prices = list of dicts [{time, open, high, low, close, volume}, ...]
    """
    df = pd.DataFrame(prices)
    features = compute_features(df)
    if features is None:
        return {"action": "HOLD", "prob": 0.0}

    prob = model.predict_proba([features])[0][1]  # probability of UP
    if prob > 0.55:
        return {"action": "BUY", "prob": float(prob)}
    elif prob < 0.45:
        return {"action": "SELL", "prob": float(prob)}
    else:
        return {"action": "HOLD", "prob": float(prob)}