# train.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load your real intraday data
df = pd.read_csv("data/intraday.csv")

# Make sure datetime is parsed properly
df["datetime"] = pd.to_datetime(df["datetime"])

# Feature engineering
df["returns"] = df["close"].pct_change()
df["volatility"] = df["returns"].rolling(window=5).std()
df.dropna(inplace=True)

# Features and target
X = df[["open", "high", "low", "close", "volume", "returns", "volatility"]]
y = (df["returns"].shift(-1) > 0).astype(int)  # 1 = next candle up, 0 = down

# Train/test split (time-series -> no shuffle)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# Train Random Forest model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, "model.pkl")

print("✅ Model trained and saved as model.pkl")