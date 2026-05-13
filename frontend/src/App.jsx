import { useEffect, useState } from "react";
import { fetchSummary } from "./api/client";

function App() {

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function loadData() {

      try {

        const data = await fetchSummary();

        setSummary(data);

      } catch (err) {

        console.error(err);

        setError(err.message);
      }
    }

    loadData();

  }, []);

  if (error) {

    return (
      <div style={{
        padding: "40px",
        fontFamily: "Arial",
      }}>
        <h1>API Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) {

    return (
      <div style={{
        padding: "40px",
        fontFamily: "Arial",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      padding: "40px",
      background: "#111827",
      color: "white",
      minHeight: "100vh",
      fontFamily: "Arial",
    }}>

      <h1>Cloud Infrastructure Discovery</h1>

      <h2>Infrastructure Summary</h2>

      <p>
        Total Resources:
        {" "}
        {summary.total_resources}
      </p>

      <p>
        Total Monthly Cost:
        {" "}
        ${summary.total_monthly_cost}
      </p>

      <h2>Cost Breakdown</h2>

      <ul>
        {
          Object.entries(summary.categories).map(
            ([category, details]) => (
              <li key={category}>
                <strong>{category}</strong>
                {" → "}
                ${details.monthly_cost}
                {" "}
                (
                {details.resource_count}
                {" resources)"}
              </li>
            )
          )
        }
      </ul>

    </div>
  );
}

export default App;
