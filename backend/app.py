import logging
from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from services.ingestion import load_resources
from routes.api import api_bp

# ---------------------------------------------------
# Logging Configuration
# ---------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------
# Flask App Initialization
# ---------------------------------------------------

application = Flask(
    __name__,
    static_folder="../frontend/dist",
    static_url_path="/"
)

CORS(application)

# ---------------------------------------------------
# Load Infrastructure Data
# ---------------------------------------------------

DATA_FILE = Path(__file__).parent / "data" / "mock_infrastructure.json"

try:
    resources = load_resources(DATA_FILE)

    logger.info(
        "Loaded %d resources from %s",
        len(resources),
        DATA_FILE
    )

except Exception as e:
    logger.exception("Failed to load infrastructure data")
    resources = []

# Make resources accessible globally
application.config["RESOURCES"] = resources

# ---------------------------------------------------
# Register API Routes
# ---------------------------------------------------

application.register_blueprint(api_bp, url_prefix="/api")

# ---------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------

@application.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "resources_loaded": len(resources)
    })

# ---------------------------------------------------
# Frontend Support
# ---------------------------------------------------

@application.route("/")
def serve_frontend():
    dist_path = Path(application.static_folder)

    index_file = dist_path / "index.html"

    if index_file.exists():
        return send_from_directory(dist_path, "index.html")

    return jsonify({
        "message": "Cloud Infrastructure Discovery API Running",
        "frontend": "React frontend not built yet"
    })

# ---------------------------------------------------
# Start Application
# ---------------------------------------------------

if __name__ == "__main__":
    logger.info(
        "Starting Cloud Infra Discovery on http://localhost:5001"
    )

    application.run(
        debug=True,
        host="0.0.0.0",
        port=5001
    )
