const API_BASE_URL = "http://localhost:5001/api";

async function request(endpoint) {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `API error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchSummary() {
  return request("/summary");
}

export async function fetchResources() {
  return request("/resources");
}

export async function fetchCostBreakdown() {
  return request("/cost-breakdown");
}
