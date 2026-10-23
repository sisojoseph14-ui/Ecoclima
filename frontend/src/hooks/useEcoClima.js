import { useState, useEffect } from 'react';

// Cambiarás 'localhost' por tu IP local en el siguiente paso
const API_URL = 'http://192.168.5.164:8000/api/sensors';

export const useEcoClima = (pollingInterval = 3000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error de conexión');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, pollingInterval);
    return () => clearInterval(intervalId);
  }, [pollingInterval]);

  return { data, loading, error };
};