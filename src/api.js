// src/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || '';

// 获取 token
const getToken = () => localStorage.getItem('token');

// 通用请求函数
export async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  
  if (data.code === 0) {
    return data.data;
  } else {
    throw new Error(data.message || `请求失败 (${response.status})`);
  }
}

export async function uploadFile(url, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (data.code === 0) {
    return data.data;
  }

  throw new Error(data.message || `请求失败 (${response.status})`);
}

export async function requestForm(url, formData, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    method: options.method || 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (data.code === 0) {
    return data.data;
  }

  throw new Error(data.message || `请求失败 (${response.status})`);
}

export async function fetchProtectedAsset(url) {
  const token = getToken();
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ORIGIN}${url}`, { headers });
  if (!response.ok) {
    throw new Error(`图片加载失败 (${response.status})`);
  }

  return URL.createObjectURL(await response.blob());
}

export function resolveAssetUrl(url) {
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

// 封装各模块接口
export const postAPI = {
  getList: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts?${query}`);
  },
  getDetail: (id) => request(`/posts/${id}`),
  create: (body) => request('/posts', { method: 'POST', body: JSON.stringify(body) }),
  search: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts/search?${query}`);
  },
  like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
  collect: (id) => request(`/posts/${id}/collect`, { method: 'POST' }),
  addComment: (id, body) => request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  deleteMine: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};

export const categoryAPI = {
  getList: () => request('/posts/categories'),
};

export const userAPI = {
  login: (body) => request('/user/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => {
    if (body instanceof FormData) {
      return requestForm('/user/register', body);
    }
    return request('/user/register', { method: 'POST', body: JSON.stringify(body) });
  },
  getProfile: () => request('/user/profile'),
  updateProfile: (body) => request('/user/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getMyPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/profile/posts${query ? `?${query}` : ''}`);
  },
  getMyLikes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/profile/likes${query ? `?${query}` : ''}`);
  },
  getMyFavorites: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/profile/favorites${query ? `?${query}` : ''}`);
  },
  getMyHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/profile/history${query ? `?${query}` : ''}`);
  },
  getMyComments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/profile/comments${query ? `?${query}` : ''}`);
  },
  uploadAvatar: (file) => uploadFile('/upload/avatar', file),
  getPublicProfile: (id) => request(`/user/${id}`),
  getUserPosts: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/${id}/posts${query ? `?${query}` : ''}`);
  },
};

export const reportAPI = {
  submit: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
};

export const adminAPI = {
  getPendingPosts: () => request('/admin/pending-posts'),
  approvePost: (id) => request(`/admin/approve-post/${id}`, { method: 'POST' }),
  deletePost: (id) => request(`/admin/delete-post/${id}`, { method: 'DELETE' }),
  getReports: () => request('/admin/reports'),
  confirmReport: (id) => request(`/admin/confirm-report/${id}`, { method: 'POST' }),
  rejectReport: (id) => request(`/admin/reject-report/${id}`, { method: 'POST' }),
  getRegistrations: () => request('/admin/registrations'),
  approveRegistration: (id) => request(`/admin/registrations/${id}/approve`, { method: 'POST' }),
  rejectRegistration: (id) => request(`/admin/registrations/${id}/reject`, { method: 'POST' }),
};
