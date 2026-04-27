import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Pages-2/Home'
import PostDetail from './Pages-2/PostDetail'
import CreatePost from './Pages-2/CreatePost'

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '10px', background: '#f0f0f0' }}>
          <Link to="/" style={{ marginRight: '15px' }}>首页</Link>
          <Link to="/create" style={{ marginRight: '15px' }}>发帖</Link>
          <Link to="/post/1">帖子示例</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App