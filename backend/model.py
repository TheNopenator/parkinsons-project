from flask import Flask, jsonify
import pickle
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://samuelc:DataScience123@falldb.ar6mh.mongodb.net/?retryWrites=true&w=majority&appName=fallDB"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

app = Flask(__name__)
# Convert the Jupyter Notebook to a Python script
with open("fall_detection_model.pkl", "rb") as f:
    model = pickle.load(f)

try:
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
    # Route for the home page
    @app.route("/", methods=["GET"])
    def home():
        return "Flask app is working!"

    # Route for predicting fall detection
    @app.route("/predict_all", methods=["GET"])
    def predict_fall_all():
    # Query data from the 'people' collection in the 'fall' database
        db = client['fall']  # Access the 'fallDB' database
        collection = db['people']  # Access the 'people' collection
    
        people_data = collection.find()
        results = {}
        # Add the query results to result list
        for person in people_data:
            acc_max = person['acc_max']
            gyro_max = person['gyro_max']
            post_gyro_max = person['post_gyro_max']
            lin_max = person['lin_max']
            post_lin_max = person['post_lin_max']
            phone_number = person['phoneNumber']
            fall_rate = model.predict([[acc_max, gyro_max, post_gyro_max, lin_max, post_lin_max]])
            results[person['name']] = [int(fall_rate[0]), phone_number]
        return jsonify(results)
except Exception as e:
    print(e)

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Runs on localhost:5001