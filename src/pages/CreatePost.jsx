import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  // 1. 定义状态：用于存储标题和内容
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');          // 图片地址（后期后端返回，目前用本地临时链接）

  // 2. useNavigate 用于提交后跳转
  const navigate = useNavigate();

  // --- 新增：处理从电脑选择图片 ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 限制文件大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    // 释放之前的临时链接（避免内存泄漏）
    if (image) {
      URL.revokeObjectURL(image);
    }

    // 生成本地临时链接用于预览
    const localUrl = URL.createObjectURL(file);
    setImage(localUrl);
  };

  // --- 新增：清除已选图片 ---
  const handleClearImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage('');
  };

  // 3. 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('新帖子的标题：', title);
    console.log('新帖子的内容：', content);
    console.log('新帖子的图片文件（本地预览链接）：', image);

    alert(`帖子已发布！\n标题：${title}\n内容：${content}\n图片：${image ? '已选择图片' : '无'}`);

    // 清空表单
    setTitle('');
    setContent('');
    handleClearImage();  // 清除图片及临时链接

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

        {/* ========== 图片区域（替换原有的图片链接输入框） ========== */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            图片（可选）
          </label>

          {/* 文件选择按钮 */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              📁 从电脑选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>

            {image && (
              <button
                type="button"
                onClick={handleClearImage}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ❌ 清除图片
              </button>
            )}
          </div>

          {/* 图片预览 */}
          {image && (
            <img
              src={image}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '4px',
                display: 'block'
              }}
            />
          )}
        </div>
        {/* ========== 图片区域结束 ========== */}

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