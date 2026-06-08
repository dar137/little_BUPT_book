// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 当前登录用户信息，null 表示未登录
  const [currentUser, setCurrentUser] = useState(null);

  // 初始化：从 localStorage 读取已登录用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  // 登录函数（模拟后端验证，支持管理员和普通用户）
  const login = async (username, password) => {
    // 模拟管理员账号
    if (username === 'admin' && password === 'admin') {
      const user = {
        id: 1,
        username: 'admin',
        name: '平台管理员',
        role: 'admin',
        studentId: '00000000',
        email: 'admin@bupt.edu.cn',
        bio: '平台管理员',
        avatar: '',
      };
      setCurrentUser(user);
      localStorage.setItem('token', 'fake-token-admin');
      localStorage.setItem('userInfo', JSON.stringify(user));
      return { success: true, user };
    } 
    // 模拟普通用户（原有 123/123）
    else if (username === '123' && password === '123') {
      const user = {
        id: 2,
        username: '123',
        name: '测试用户',
        role: 'user',
        studentId: '20240001',
        email: 'test@bupt.edu.cn',
        bio: '这个人很懒，什么都没写~',
        avatar: '',
      };
      setCurrentUser(user);
      localStorage.setItem('token', 'fake-token-user');
      localStorage.setItem('userInfo', JSON.stringify(user));
      return { success: true, user };
    } 
    else {
      return { success: false, message: '用户名或密码错误' };
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

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
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