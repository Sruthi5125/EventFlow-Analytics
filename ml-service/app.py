from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from recommendations import RecommendationEngine

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize recommendation engine
DATABASE_URL = os.getenv('DATABASE_URL')
engine = RecommendationEngine(DATABASE_URL)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "ML Recommendations"}), 200

@app.route('/recommendations/<int:organizer_id>', methods=['GET'])
def get_recommendations(organizer_id):
    """Get all recommendations for an organizer"""
    try:
        recommendations = engine.get_all_recommendations(organizer_id)
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/<int:organizer_id>/day', methods=['GET'])
def get_day_recommendation(organizer_id):
    """Get best day recommendation"""
    try:
        recommendation = engine.get_best_day_recommendation(organizer_id)
        return jsonify(recommendation), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/<int:organizer_id>/category', methods=['GET'])
def get_category_recommendation(organizer_id):
    """Get best category recommendation"""
    try:
        recommendation = engine.get_best_category_recommendation(organizer_id)
        return jsonify(recommendation), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/<int:organizer_id>/timing', methods=['GET'])
def get_timing_recommendation(organizer_id):
    """Get best timing recommendation"""
    try:
        recommendation = engine.get_timing_recommendation(organizer_id)
        return jsonify(recommendation), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations/<int:organizer_id>/engagement', methods=['GET'])
def get_engagement_insights(organizer_id):
    """Get engagement insights"""
    try:
        insights = engine.get_engagement_insights(organizer_id)
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"🤖 ML Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)