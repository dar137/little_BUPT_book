// src/api.js
const BASE_URL = 'http://localhost:5000/api';

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

  const data = await response.json();
  
  if (data.code === 0) {
    return data.data;
  } else {
    throw new Error(data.message || '请求失败');
  }
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
};

export const userAPI = {
  login: (body) => request('/user/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/user/register', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/user/profile'),
};

export const reportAPI = {
  submit: (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
};