// src/mockData.js
// 在 mockData.js 顶部添加这个函数
const isFavorited = (postId) => {
  return false; // 或者从 localStorage 读取
};
export const posts = [
  {
    id: 1,
    title: '有同学一起组队参加大创吗？',
    content: '想找一个前端和一个后端，项目是关于校园二手交易的...',
    author: '小明',
    time: '10分钟前',
    tag: '组队',
    likes: 5,
    collects: 2,
    image: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: 2,
    title: '图书馆四楼捡到一张校园卡',
    content: '失主叫张三，学号2024xxxx，请失主联系我...',
    author: '热心同学',
    time: '1小时前',
    tag: '失物招领',
    likes: 5,
    collects: 2,
    image: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: 3,
    title: '求推荐好用的笔记软件',
    content: '之前一直用Notion，但最近觉得有点重，有没有轻量一点的推荐？',
    author: '笔记达人',
    time: '3小时前',
    tag: '学习交流',
    likes: 5,
    collects: 2,
    image: 'https://picsum.photos/400/200?random=1'
  },
];

export const comments = [
  { id: 1, postId: 1, author: '路人甲', content: '我也在找队友！我是后端的，可以聊一聊吗？', time: '5分钟前' },
  { id: 2, postId: 1, author: '小明', content: '欢迎！已经私信你了。', time: '3分钟前' },
  { id: 3, postId: 2, author: '失主本人', content: '谢谢！已经联系了。', time: '30分钟前' },
];
//从所有帖子中，筛选出ID在 favoriteIds集合里的帖子
  const favoritePosts = posts.filter(post => isFavorited(post.id));
