import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function useCountriesList() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(`${API}/countries?limit=100`)
      .then(r => r.json()).then(j => setData(j.data || j || []))
      .catch(() => {});
  }, []);
  return { data };
}