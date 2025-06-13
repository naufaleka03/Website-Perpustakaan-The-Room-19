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

@app.route('/user-preferences/recommendation', methods=['GET'])
def recommend():
    pref_id = request.args.get('id')
    print('Received pref_id:', pref_id)
    if not pref_id:
        return jsonify({'error': 'id is required'}), 400
    try:
        recs = get_recommendations_for_user(pref_id)
        return jsonify({'recommendations': recs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)
