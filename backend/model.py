from flask import Flask, jsonify
from pymongo import MongoClient
import numpy as np
import pickle
import os

app = Flask(__name__)

# Convert the Jupyter Notebook to a Python script
with open("fall_detection_model.pkl", "rb") as f:
    model = pickle.load(f)

# Connect to MongoDB
client = MongoClient("mongodb+srv://samuelc:Datascience1@falldb.ar6mh.mongodb.net/")  # Update if using MongoDB Atlas
db = client["fallDetectionDB"]
collection = db["gyroData"]

# Route for the root URL "/"
@app.route("/", methods=["GET"])
def home():
    return "Welcome to the Fall Detection App!"

@app.route("/predict", methods=["GET"])
def predict_fall():
    # Fetch latest gyro data
    gyro_data = collection.find_one(sort=[("_id", -1)])
    
    if not gyro_data:
        return jsonify({"error": "No data found"}), 404

    # Extract relevant features
    features = ["acc_max", "gyro_max", "post_gyro_max", "lin_max", "post_lin_max"]
    input_data = np.array([gyro_data[feature] for feature in features]).reshape(1, -1)

    # Predict
    fall_prediction = model.predict(input_data)[0]
    result = "fall detected" if fall_prediction == 1 else "no fall detected"

    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Runs on localhost:5001