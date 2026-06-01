import { createContext, useContext, useState } from 'react';

// 1. 创建上下文（仓库）
const AuthContext = createContext();

// 2. 仓库管理员（Provider组件）
export function AuthProvider({ children }) {
  // 当前登录用户信息，null 表示未登录
  const [currentUser, setCurrentUser] = useState(null);

  // 登录函数（后期替换为 fetch 请求后端）
  const login = async (username, password) => {
    // 临时模拟：假设用户名和密码都是 "123" 即可登录
    if (username === '123' && password === '123') {
      const user = {
        id: 1,
        username: '123',
        nickname: '测试用户',
        avatar: '',            // 头像URL，初始为空
        role: 'user'           // 角色：'user' 或 'admin'
      };
      setCurrentUser(user);
      return { success: true };
    } else {
      return { success: false, message: '用户名或密码错误' };
    }
  };

  // 登出函数
  const logout = () => {
    setCurrentUser(null);
  };

  // 更新当前用户信息（比如修改头像、昵称后调用）
  const updateUser = (newInfo) => {
    setCurrentUser(prev => ({ ...prev, ...newInfo }));
  };

  // 3. 把数据和操作方法共享给所有子组件
  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. 自定义 Hook，方便其他组件读取
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}