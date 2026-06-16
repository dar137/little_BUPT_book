// mockData.js （替换你整个文件）
export const posts = [
  {
    id: 1,
    title: '有同学一起组队参加大创吗？',
    content: '想找一个前端和一个后端，项目是关于校园二手交易的...',
    summary: '想找一个前端和一个后端，项目是关于校园二手交易的...',
    // 只改这里：把对象改成字符串，就不报错了
    author: '小明',
    createdAt: '2026-06-08 10:00:00',
    category: '组队',
    coverImage: 'https://picsum.photos/400/200?random=1',
    likesCount: 5,
    commentsCount: 2,
    collectsCount: 2
  },
  {
    id: 2,
    title: '图书馆四楼捡到一张校园卡',
    content: '失主叫张三，学号2024xxxx，请失主联系我...',
    summary: '失主叫张三，学号2024xxxx，请失主联系我...',
    // 只改这里
    author: '热心同学',
    createdAt: '2026-06-08 11:00:00',
    category: '失物招领',
    coverImage: 'https://picsum.photos/400/200?random=2',
    likesCount: 10,
    commentsCount: 1,
    collectsCount: 3
  },
  {
    id: 3,
    title: '求推荐好用的笔记软件',
    content: '之前一直用Notion，但最近觉得有点重，有没有轻量一点的推荐？',
    summary: '之前一直用Notion，但最近觉得有点重，有没有轻量一点的推荐？',
    // 只改这里
    author: '笔记达人',
    createdAt: '2026-06-08 12:00:00',
    category: '学习交流',
    coverImage: 'https://picsum.photos/400/200?random=3',
    likesCount: 8,
    commentsCount: 0,
    collectsCount: 1
  },
];

export const comments = [
  {
    id: 1,
    postId: 1,
    author: '路人甲',
    content: '我也在找队友！我是后端的，可以聊一聊吗？',
    createdAt: '2026-06-08 10:05:00'
  },
  {
    id: 2,
    postId: 1,
    author: '小明',
    content: '欢迎！已经私信你了。',
    createdAt: '2026-06-08 10:10:00'
  },
  {
    id: 3,
    postId: 2,
    author: '失主本人',
    content: '谢谢！已经联系了。',
    createdAt: '2026-06-08 11:30:00'
  },
];