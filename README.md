# ☁️ Cloud Infrastructure Discovery & Visibility Module

This project is a simplified cloud infrastructure discovery system built as part of the Backend Engineer assignment for White Code Labs.

The application ingests mock cloud infrastructure data, classifies resources into categories such as compute, storage, and networking, calculates infrastructure costs, and presents the data through REST APIs and a small React dashboard.

The goal of this project was not to build a production cloud platform, but to demonstrate backend architecture, data modeling, API design, and infrastructure visibility concepts in a clean and extensible way.

---

# Features

* Load mock infrastructure resources from a JSON dataset
* Validate and normalize resource data
* Categorize resources into:

  * Compute
  * Storage
  * Networking
* Aggregate infrastructure costs
* Generate infrastructure summary insights
* REST API endpoints for querying infrastructure data
* Simple React dashboard for visualization
* Basic edge-case handling and validation

---

# Tech Stack

## Backend

* Python
* Flask

## Frontend

* React
* Vite

---

# Project Structure

```txt
cloud-infra-discovery/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── data/
│   │   └── mock_infrastructure.json
│   ├── models/
│   │   └── resource.py
│   ├── services/
│   │   ├── ingestion.py
│   │   ├── classifier.py
│   │   └── cost_engine.py
│   └── routes/
│       └── api.py
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Running The Project

## Prerequisites

Make sure these are installed:

* Python 3.10+
* Node.js 18+

---

# Backend Setup

```bash
cd backend

python3 -m venv venv

source venv/bin/activate
# Windows:
# venv\\Scripts\\activate

pip install -r requirements.txt

python app.py
```

Backend runs on:

```txt
http://localhost:5001
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# API Endpoints

| Endpoint              | Description                              |
| --------------------- | ---------------------------------------- |
| `/api/resources`      | List all infrastructure resources        |
| `/api/summary`        | Infrastructure cost and resource summary |
| `/api/cost-breakdown` | Cost breakdown grouped by category       |
| `/api/categories`     | Supported resource categories            |
| `/health`             | Health check endpoint                    |

---

# Example Summary Response

```json
{
  "total_resources": 22,
  "total_monthly_cost": 12400.0,
  "currency": "USD",
  "period": "monthly",
  "categories": {
    "compute": {
      "monthly_cost": 8200.0,
      "resource_count": 9
    },
    "storage": {
      "monthly_cost": 2600.0,
      "resource_count": 7
    },
    "networking": {
      "monthly_cost": 1600.0,
      "resource_count": 6
    }
  }
}
```

---

# Implementation Notes

## Data Ingestion

The backend loads infrastructure data from a mock JSON file during application startup.

The ingestion layer:

* validates required fields
* normalizes invalid or missing cost values
* skips malformed records safely
* logs warnings for invalid resources

---

## Resource Classification

Resources are categorized using a centralized type-mapping approach.

Example:

* EC2 → Compute
* S3 → Storage
* VPC → Networking

This makes the system easy to extend when adding support for additional cloud services.

---

## Cost Aggregation

The cost engine calculates:

* total infrastructure cost
* cost per category
* resource counts
* zero-cost resources

All costs are treated as monthly USD estimates.

---

## Frontend

The frontend is intentionally lightweight.

It fetches infrastructure data from the Flask API and displays:

* infrastructure summary
* category breakdown
* resource statistics

The focus was functionality and clarity rather than heavy UI design.

---

# Edge Cases Handled

The system handles scenarios such as:

* missing required fields
* null or invalid costs
* zero-cost resources
* unknown resource types
* duplicate IDs
* empty datasets

Invalid resources are skipped safely without crashing the application.

---

# Assumptions

* Infrastructure data is mock AWS-style data
* All costs are monthly estimates in USD
* Authentication is intentionally out of scope
* Resources are stored in memory after ingestion
* Real AWS integration is not included

---

# Future Improvements

Some improvements that could be added in a production-ready version:

* Real AWS integration using boto3
* PostgreSQL or MongoDB persistence
* Docker and Docker Compose support
* Kubernetes deployment manifests
* Authentication and RBAC
* Historical cost trend analysis
* Multi-cloud support
* Real-time infrastructure discovery

---

# Screenshots

Screenshots of the dashboard and API responses are included in the project submission.

---

# Author

Gitesh Pradhan
# cloud-infra-discovery
