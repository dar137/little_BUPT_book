import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Report from './pages/Report'

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '10px', background: '#f0f0f0' }}>
          <Link to="/" style={{ marginRight: '15px' }}>首页</Link>
          <Link to="/create" style={{ marginRight: '15px' }}>发帖</Link>
          <Link to="/search" style={{ marginRight: '15px' }}>搜索</Link>
          <Link to="/profile" style={{ marginRight: '15px' }}>我的</Link>
          <Link to="/login" style={{ marginRight: '15px' }}>登录</Link>
          <Link to="/register" style={{ marginRight: '15px' }}>注册</Link>
          <Link to="/report" style={{ marginRight: '15px' }}>举报</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App