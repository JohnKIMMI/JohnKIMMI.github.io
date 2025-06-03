import pandas as pd

music_df = pd.read_csv("Top-50-musicality-global.csv")

features = [
    "Danceability", "Acousticness", "duration", "Energy", "Instrumentalness",
    "Key", "Liveness", "Loudness", "Mode", "Speechiness",
    "Tempo", "TSignature", "Positiveness"
]

country_avg = music_df.groupby("Country")[features].mean().reset_index()
country_avg = country_avg.rename(columns={"Country": "id"})

country_avg.to_csv("country_avg_features.csv", index=False)

global_avg = music_df[features].mean().to_frame().T
global_avg.insert(0, "id", "Global")
global_avg.to_csv("global_avg_features.csv", index=False)
