import pandas as pd
import matplotlib.pyplot as plt
import requests

# Pull Data From API
API_URL = "http://localhost:3000/soil-data"
response = requests.get(API_URL)
data = response.json()

df = pd.DataFrame(data)

# Soil Nutrient Bar Chart
nutrients = ["nitrogen", "phosphorus", "potassium"]
df[nutrients].mean().plot(kind="bar")
plt.title("Average Soil Nutrient Levels")
plt.xlabel("Nutrients")
plt.ylabel("Level")
plt.tight_layout()
plt.savefig("nutrient_levels.png")
plt.clf()

# pH Distribution Histogram
plt.hist(df["pH"], bins=10)
plt.title("Soil pH Distribution")
plt.xlabel("pH Level")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("ph_distribution.png")
plt.clf()

# Moisture Over Time (if timestamps exist)
if "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")

    plt.plot(df["timestamp"], df["moisture"])
    plt.title("Soil Moisture Over Time")
    plt.xlabel("Time")
    plt.ylabel("Moisture Level")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig("moisture_over_time.png")
    plt.clf()

# Soil Type Breakdown Pie Chart
if "soil_type" in df.columns:
    df["soil_type"].value_counts().plot(kind="pie", autopct="%1.1f%%")
    plt.title("Soil Type Distribution")
    plt.tight_layout()
    plt.savefig("soil_type_distribution.png")
    plt.clf()

print("✔ Analytics generated successfully.")
