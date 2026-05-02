import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/apiBase";

export function useServices(params = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFetch("/services", { signal });
      
      if (result.ok) {
        const data = await result.json();
        const list = data?.data || data?.services || data || [];
        setServices(Array.isArray(list) ? list : []);
      } else {
        setServices([]);
        setError("Failed to load services");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setServices([]);
        setError(err?.message || "Failed to load services");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => controller.abort();
  }, [fetchServices]);

  const refetch = useCallback((signal) => {
    fetchServices(signal);
  }, [fetchServices]);

  return { services, loading, error, refetch };
}

export function useService(idOrSlug) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }
    
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchService = async () => {
      try {
        const result = await apiFetch(`/services/${idOrSlug}`, { 
          signal: controller.signal 
        });
        
        if (result.ok) {
          const data = await result.json();
          setService(data?.data || data);
        } else {
          setError("Failed to load service");
          setService(null);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load service");
          setService(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchService();

    return () => controller.abort();
  }, [idOrSlug]);

  return { service, loading, error };
}
