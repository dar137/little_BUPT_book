// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 当前登录用户信息，null 表示未登录
  const [currentUser, setCurrentUser] = useState(null);
  // 加载状态：初始化时从 localStorage 恢复用户信息需要时间
  const [loading, setLoading] = useState(true);

  // 初始化：从 localStorage 读取已登录用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (e) {
        // 如果解析失败，清除无效数据
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // 登录函数：调用真实后端接口
  const login = async (username, password) => {
    try {
      const result = await userAPI.login({ username, password });
      
      // 保存 token
      localStorage.setItem('token', result.token);
      // 保存用户信息
      localStorage.setItem('userInfo', JSON.stringify(result.user));
      // 更新全局状态
      setCurrentUser(result.user);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || '登录失败，请稍后重试' };
    }
  };

  // 登出函数
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  // 更新当前用户信息（如修改头像、昵称等）
  const updateUser = (newInfo) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...newInfo };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      return updated;
    });
  };

  // 如果还在初始化加载中，可以返回 null 或 loading 状态
  // 这里直接渲染 children，由各组件自己处理 currentUser 为 null 的情况

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}