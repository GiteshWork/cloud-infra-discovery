import json
import logging

from services.classifier import classify_resource

logger = logging.getLogger(__name__)


def load_resources(file_path):
    """
    Load infrastructure resources from JSON file.
    """

    with open(file_path, "r") as f:
        raw_data = json.load(f)

    # Handle wrapped structure
    raw_resources = raw_data.get("resources", [])

    resources = []
    warnings = 0

    for item in raw_resources:

        try:

            if not isinstance(item, dict):
                raise ValueError("Invalid resource format")

            resource = classify_resource(item)

            if resource:
                resources.append(resource)

        except Exception as e:
            warnings += 1
            logger.warning(
                f"Skipping invalid resource: {e}"
            )

    logger.info(
        "Ingestion complete: %d resources loaded, %d warnings",
        len(resources),
        warnings
    )

    return resources
