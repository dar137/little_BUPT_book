import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  // 1. 定义状态：用于存储标题和内容
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 2. useNavigate 用于提交后跳转
  const navigate = useNavigate();

  // 3. 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault(); // 阻止表单默认提交行为（会刷新页面）
    
    // 现在只是模拟提交，把数据打印到控制台
    console.log('新帖子的标题：', title);
    console.log('新帖子的内容：', content);
    alert(`帖子已发布！\n标题：${title}\n内容：${content}`);
    
    // 以后这里会换成 fetch 请求，把数据发给后端
    
    // 清空表单
    setTitle('');
    setContent('');
    
    // 跳转回首页
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>✏️ 发布新帖</h2>
      
      <form onSubmit={handleSubmit}>
        {/* 标题输入框 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            标题
          </label>
          <input
            type="text"
            placeholder="请输入标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 内容输入框 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            内容
          </label>
          <textarea
            placeholder="请输入内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          发布
        </button>
      </form>
    </div>
  );
}

export default CreatePost;