import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function useDestinationsList() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(`${API}/destinations?limit=200&is_active=true`)
      .then(r => r.json()).then(j => setData(j.data || j || []))
      .catch(() => {});
  }, []);
  return { data };
}