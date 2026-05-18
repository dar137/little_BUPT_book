import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FavoriteProvider } from './context/FavoriteContext'  // 1. 导入

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoriteProvider>   {/* 2. 包裹 App */}
      <App />
    </FavoriteProvider>
  </StrictMode>,
)
