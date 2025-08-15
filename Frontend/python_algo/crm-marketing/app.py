from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.campaign_routes import campaign_bp
from routes.template_routes import template_bp
from routes.integration_routes import integration_bp
from db import get_db, close_db_connection

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:8083").split(",")
CORS(app, resources={r"/api/marketing/*": {"origins": cors_origins}})

# Register blueprints
app.register_blueprint(campaign_bp, url_prefix="/api/marketing")
app.register_blueprint(template_bp, url_prefix="/api/marketing")
app.register_blueprint(integration_bp, url_prefix="/api/marketing")

# Root route
@app.route("/")
def index():
    return jsonify({
        "message": "Lanka Smart CRM Hub - Marketing API",
        "version": "1.0.0",
        "status": "running"
    })

# Health check route
@app.route("/health")
def health():
    try:
        # Check database connection
        db = get_db()
        db.admin.command("ping")

        return jsonify({
            "status": "healthy",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Not found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

# Cleanup database connection when the app is shutting down
@app.teardown_appcontext
def teardown_db(exception):
    close_db_connection()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    debug = os.environ.get("FLASK_ENV") == "development"

    print(f"Starting marketing backend on port {port}...")
    print(f"CORS configured for origins: {cors_origins}")
    app.run(host="0.0.0.0", port=port, debug=debug)
