const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const humanizeText = async (payload) => {
  const response = await fetch(`${API_BASE}/humanize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API error');
  }

  const data = await response.json();
  return data.data || data;
};

export const fetchHistory = async () => {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};

export default {};
