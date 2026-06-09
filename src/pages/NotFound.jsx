import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ maxWidth: '720px', margin: '64px auto', padding: '24px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '12px' }}>页面不存在</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        当前访问的路径未注册为真实前端路由。
      </p>
      <Link to="/" style={{ color: '#1677ff', textDecoration: 'none' }}>
        返回首页
      </Link>
    </div>
  );
}

export default NotFound;
