function CategoryTabs({ tags = ['全部'], activeTag, onTagChange }) {
  return (
    <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          style={{
            padding: '6px 14px',
            border: '1px solid #1890ff',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            // 核心：当前选中的标签和未选中的标签样式不同
            backgroundColor: activeTag === tag ? '#1890ff' : 'white',
            color: activeTag === tag ? 'white' : '#1890ff',
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
