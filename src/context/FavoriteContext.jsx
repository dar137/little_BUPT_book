// src/context/FavoriteContext.jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建一个“上下文”，也就是我们的“仓库”
const FavoriteContext = createContext();

// 2. 创建一个“仓库管理员”，它会包裹整个应用，把收藏状态分享出去
export function FavoriteProvider({ children }) {
  // favoriteIds 是一个 Set 结构，用来存储已收藏帖子的ID，它会自动去重，查询也快
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // 切换收藏状态：传一个帖子ID，已收藏就取消，未收藏就添加
  const toggleFavorite = (postId) => {
    // setFavoriteIds的回调函数中，prev是一个最新的Set，我们要基于它创建新Set
    setFavoriteIds(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(postId)) {
        newFavorites.delete(postId);
      } else {
        newFavorites.add(postId);
      }
      return newFavorites;
    });
  };

  // 检查一个帖子ID是否已被收藏，返回 true 或 false
  const isFavorited = (postId) => {
    return favoriteIds.has(postId);
  };

  // 3. 通过 Context.Provider 组件，把这些值和方法共享给所有子组件
  return (
    <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite, isFavorited }}>
      {children}
    </FavoriteContext.Provider>
  );
}

// 4. 封装一个自定义 Hook，让其他组件能更方便地使用这个仓库
export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}