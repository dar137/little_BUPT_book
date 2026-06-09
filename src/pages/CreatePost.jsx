import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, postAPI } from '../api';
import { useAuth } from '../context/AuthContext';

// 图片上传接口的基础路径（与 api.js 中的 BASE_URL 保持一致）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || '';
const MAX_IMAGES = 9;

function CreatePost() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 表单字段
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');           // 分类
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [imageFiles, setImageFiles] = useState([]);       // 用户选择的文件对象
  const [imagePreviews, setImagePreviews] = useState([]); // 本地预览链接
  const [uploadedUrls, setUploadedUrls] = useState([]);   // 上传后服务器返回的 URL
  const [uploading, setUploading] = useState(false);      // 上传中状态
  const [submitting, setSubmitting] = useState(false);    // 提交中状态
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoryError('');
      try {
        const result = await categoryAPI.getList();
        setCategories(result.list || []);
      } catch (err) {
        setCategoryError(err.message || '分类加载失败');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 处理从电脑选择图片
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (imageFiles.length + selectedFiles.length > MAX_IMAGES) {
      alert(`最多选择 ${MAX_IMAGES} 张图片`);
      e.target.value = '';
      return;
    }

    if (selectedFiles.some(file => file.size > 5 * 1024 * 1024)) {
      alert('图片大小不能超过 5MB');
      e.target.value = '';
      return;
    }

    setImageFiles(prev => [...prev, ...selectedFiles]);
    setImagePreviews(prev => [...prev, ...selectedFiles.map(file => URL.createObjectURL(file))]);
    setUploadedUrls([]);  // 重新选择图片后清除已上传的 URL
    e.target.value = '';
  };

  // 清除图片
  const handleClearImage = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setUploadedUrls([]);
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedUrls([]);
  };

  // 上传图片到服务器
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];  // 没有选择图片，直接返回空数组
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const urls = [];

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);

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
            : `${API_ORIGIN}${result.data.url}`;
          urls.push(fullUrl);
        } else {
          throw new Error(result.message || '上传失败');
        }
      }

      setUploadedUrls(urls);
      return urls;
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
    if (category === '二手交易' && !estimatedPrice.trim()) {
      alert('请输入预估价格');
      return;
    }

    setSubmitting(true);
    try {
      // 1. 如果有图片且未上传，先上传图片
      let imageUrls = uploadedUrls;
      if (imageFiles.length > 0 && uploadedUrls.length === 0) {
        imageUrls = await uploadImages();
        if (!imageUrls) {
          setSubmitting(false);
          return;  // 上传失败，中止提交
        }
      }

      // 2. 提交帖子
      await postAPI.create({
        title: title.trim(),
        content: content.trim(),
        category: category,
        estimatedPrice: category === '二手交易' ? estimatedPrice.trim() : undefined,
        images: imageUrls
      });

      alert('帖子发布成功，等待审核');
      
      // 清空表单
      setTitle('');
      setContent('');
      setCategory('');
      setEstimatedPrice('');
      handleClearImage();
      navigate('/');
    } catch (err) {
      alert('发布失败：' + (err.message || '请稍后重试'));
    } finally {
      setSubmitting(false);
    }
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
            onChange={(e) => {
              setCategory(e.target.value);
              if (e.target.value !== '二手交易') setEstimatedPrice('');
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: '#fff'
            }}
          >
            <option value="">
              {categoriesLoading ? '分类加载中...' : '请选择分类'}
            </option>
            {categories.map(cat => (
              <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {categoryError && (
            <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>{categoryError}</p>
          )}
          {!categoriesLoading && !categoryError && categories.length === 0 && (
            <p style={{ color: '#999', fontSize: '12px', marginTop: '6px' }}>暂无可用分类，请先在后端维护真实分类数据。</p>
          )}
        </div>

        {category === '二手交易' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              预估价格
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="请输入预估价格"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {/* 图片区域 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            图片（可选，最多 {MAX_IMAGES} 张）
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
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>

            {(imageFiles.length > 0 || uploadedUrls.length > 0) && (
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
                清除图片
              </button>
            )}
          </div>

          {/* 图片预览 */}
          {imagePreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '8px' }}>
              {imagePreviews.map((preview, index) => (
                <div key={preview} style={{ position: 'relative' }}>
                  <img
                    src={uploadedUrls[index] || preview}
                    alt={`预览 ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      background: 'rgba(0,0,0,0.55)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
