import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FavoriteProvider } from './context/FavoriteContext'
import { AuthProvider } from './context/AuthContext'   // ← 新增导入

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>               {/* ← 新增，放在 FavoriteProvider 外面 */}
      <FavoriteProvider>
        <App />
      </FavoriteProvider>
    </AuthProvider>
  </StrictMode>,
)