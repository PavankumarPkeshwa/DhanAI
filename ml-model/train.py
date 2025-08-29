# train.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# -----------------------------
# Load Data
# -----------------------------
df = pd.read_csv("data/intraday.csv")
df["date"] = pd.to_datetime(df["date"])

# -----------------------------
# Feature Engineering
# -----------------------------

# Returns
df["returns"] = df["close"].pct_change()

# Volatility (rolling std dev of returns)
df["volatility"] = df["returns"].rolling(window=5).std()

# Simple Moving Averages
df["sma_5"] = df["close"].rolling(window=5).mean()
df["sma_10"] = df["close"].rolling(window=10).mean()

# Exponential Moving Average
df["ema_10"] = df["close"].ewm(span=10, adjust=False).mean()

# Relative Strength Index (RSI)
delta = df["close"].diff()
gain = np.where(delta > 0, delta, 0)
loss = np.where(delta < 0, -delta, 0)
avg_gain = pd.Series(gain).rolling(window=14).mean()
avg_loss = pd.Series(loss).rolling(window=14).mean()
rs = avg_gain / (avg_loss + 1e-10)  # avoid divide by zero
df["rsi_14"] = 100 - (100 / (1 + rs))

# Bollinger Bands
df["bb_middle"] = df["close"].rolling(window=20).mean()
df["bb_upper"] = df["bb_middle"] + 2 * df["close"].rolling(window=20).std()
df["bb_lower"] = df["bb_middle"] - 2 * df["close"].rolling(window=20).std()

# Volume features
df["volume_mean_5"] = df["volume"].rolling(window=5).mean()
df["rel_volume"] = df["volume"] / (df["volume_mean_5"] + 1e-10)

# Drop NaN rows from rolling features
df.dropna(inplace=True)

# -----------------------------
# Define Features and Target
# -----------------------------
X = df[
    [
        "open",
        "high",
        "low",
        "close",
        "volume",
        "returns",
        "volatility",
        "sma_5",
        "sma_10",
        "ema_10",
        "rsi_14",
        "bb_middle",
        "bb_upper",
        "bb_lower",
        "rel_volume",
    ]
]

# Target: next candle up (1) or down (0)
y = (df["returns"].shift(-1) > 0).astype(int)
y = y.loc[X.index]  # align with X

# -----------------------------
# Train/Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# -----------------------------
# Train Model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=300, max_depth=10, random_state=42, class_weight="balanced"
)
model.fit(X_train, y_train)

# -----------------------------
# Evaluate
# -----------------------------
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# -----------------------------
# Save Model
# -----------------------------
joblib.dump(model, "model.pkl")
print("✅ Model trained and saved as model.pkl")