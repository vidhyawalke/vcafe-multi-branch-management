const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('vcafe_token');
}

export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem('vcafe_token', token);
    localStorage.setItem('vcafe_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vcafe_token');
    localStorage.removeItem('vcafe_user');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('vcafe_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    demoLogin: (persona) =>
      request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ persona })
      }),
    getMe: () => request('/auth/me'),
    getUsers: () => request('/auth/users')
  },
  branches: {
    getAll: () => request('/branches'),
    getById: (id) => request(`/branches/${id}`)
  },
  menu: {
    getCategories: () => request('/menu/categories'),
    getItems: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/menu/items?${query}`);
    },
    toggleAvailability: (id, isAvailable) =>
      request(`/menu/items/${id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable })
      })
  },
  inventory: {
    getInventory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/inventory?${query}`);
    },
    adjustStock: (payload) =>
      request('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    transferStock: (payload) =>
      request('/inventory/transfer', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/inventory/logs?${query}`);
    }
  },
  orders: {
    createOrder: (payload) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getOrders: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/orders?${query}`);
    },
    getOrderById: (id) => request(`/orders/${id}`)
  },
  reports: {
    getMetrics: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/reports/metrics?${query}`);
    }
  }
};
