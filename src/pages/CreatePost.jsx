import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// 图片上传接口的基础路径（与 api.js 中的 BASE_URL 保持一致）
const BASE_URL = 'http://localhost:5000/api';

function CreatePost() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 表单字段
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');           // 分类
  const [imageFile, setImageFile] = useState(null);       // 用户选择的文件对象
  const [imagePreview, setImagePreview] = useState('');   // 本地预览链接
  const [uploadedUrl, setUploadedUrl] = useState('');     // 上传后服务器返回的 URL
  const [uploading, setUploading] = useState(false);      // 上传中状态
  const [submitting, setSubmitting] = useState(false);    // 提交中状态

  // 可选分类列表
  const categories = ['失物招领', '学习交流', '组队', '其他'];

  // 处理从电脑选择图片
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 限制文件大小 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    // 释放之前的预览链接
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl('');  // 重新选择图片后清除已上传的 URL
  };

  // 清除图片
  const handleClearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    setUploadedUrl('');
  };

  // 上传图片到服务器
  const uploadImage = async () => {
    if (!imageFile) return null;  // 没有选择图片，直接返回 null
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${BASE_URL}/upload/post-image`, {
        method: 'POST',
        headers: {
          // 注意：上传文件时不能设置 Content-Type，让浏览器自动处理
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.code === 0) {
        // 拼接完整 URL（如果后端返回的是相对路径）
        const fullUrl = result.data.url.startsWith('http') 
          ? result.data.url 
          : `http://localhost:5000${result.data.url}`;
        setUploadedUrl(fullUrl);
        return fullUrl;
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (err) {
      alert('图片上传失败：' + (err.message || '请稍后重试'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 登录检查
    if (!currentUser) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    // 字段校验
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }
    if (!category) {
      alert('请选择分类');
      return;
    }
    if (!content.trim()) {
      alert('请输入内容');
      return;
    }

    setSubmitting(true);
    try {
      // 1. 如果有图片且未上传，先上传图片
      let imageUrl = uploadedUrl;
      if (imageFile && !uploadedUrl) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setSubmitting(false);
          return;  // 上传失败，中止提交
        }
      }

      // 2. 提交帖子
      await postAPI.create({
        title: title.trim(),
        content: content.trim(),
        category: category,
        images: imageUrl ? [imageUrl] : []
      });

      alert('帖子发布成功，等待审核');
      
      // 清空表单
      setTitle('');
      setContent('');
      setCategory('');
      handleClearImage();
      navigate('/');
    } catch (err) {
      alert('发布失败：' + (err.message || '请稍后重试'));
    } finally {
      setSubmitting(false);
    }
  };

  // 手动上传图片（在预览区提供上传按钮）
  const handleManualUpload = async () => {
    if (!imageFile) {
      alert('请先选择图片');
      return;
    }
    await uploadImage();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>✏️ 发布新帖</h2>

      <form onSubmit={handleSubmit}>
        {/* 标题 */}
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

        {/* 分类选择 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            分类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: '#fff'
            }}
          >
            <option value="">请选择分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* 图片区域 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            图片（可选）
          </label>

          {/* 文件选择按钮 */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
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

            {imageFile && !uploadedUrl && (
              <button
                type="button"
                onClick={handleManualUpload}
                disabled={uploading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #1890ff',
                  borderRadius: '4px',
                  background: uploading ? '#a0cfff' : '#e6f7ff',
                  color: uploading ? '#666' : '#1890ff',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {uploading ? '上传中...' : '☁️ 上传图片'}
              </button>
            )}

            {uploadedUrl && (
              <span style={{ color: '#52c41a', fontSize: '13px' }}>✅ 已上传</span>
            )}

            {(imageFile || uploadedUrl) && (
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
          {(imagePreview || uploadedUrl) && (
            <img
              src={uploadedUrl || imagePreview}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '4px',
                display: 'block',
                marginTop: '8px'
              }}
            />
          )}
        </div>

        {/* 内容 */}
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
          disabled={submitting || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: (submitting || uploading) ? '#a0cfff' : '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            width: '100%'
          }}
        >
          {submitting ? '发布中...' : uploading ? '请等待图片上传完成...' : '发布'}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;