const API_BASE = import.meta.env.VITE_API_URL || '';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res, fallbackMessage) {
  const text = await res.text();

  if (!text) {
    throw new Error(
      'Backend unavailable. Start the API with: cd backend && npm run dev'
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server. Check that the backend is running on port 3001.');
  }

  if (!res.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function signup(name, email, password) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return parseResponse(res, 'Signup failed');
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res, 'Login failed');
}

export async function fetchCargo(token) {
  const res = await fetch(`${API_BASE}/api/cargo`, {
    headers: authHeaders(token),
  });
  const data = await parseResponse(res, 'Failed to load cargo');
  return data.cargo;
}

export async function uploadManifest(token, file) {
  const form = new FormData();
  form.append('manifest', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  return parseResponse(res, 'Upload failed');
}
