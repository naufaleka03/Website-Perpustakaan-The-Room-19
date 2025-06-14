import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import db  # <-- import db from db.py
from recommendation import get_recommendations_for_user


app = Flask(__name__)

load_dotenv()  # Loads from .env by default

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
db.init_app(app)
CORS(app)

@app.route('/user-preferences/recommendation')
def personalized_recommendation():
    pref_id = request.args.get('id')
    top_n = int(request.args.get('top_n', 5))  # <-- get top_n from query string, default 5
    recommendations = get_recommendations_for_user(pref_id, top_n=top_n)
    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(port=5001)
