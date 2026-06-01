// Mock API with localStorage persistence to simulate a real backend

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

const DEFAULT_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Understanding Mental Health in Young Adults",
    content: "<p>Mental health is just as important as physical health. In this article, we explore the common stressors for young adults and how to build positive coping mechanisms.</p><h2>Key Stressors</h2><ul><li>Academic pressure</li><li>Social media influence</li><li>Career uncertainty</li></ul>",
    category: "Mental Health",
    status: "published",
    author: "Jane Doe",
    createdAt: "2026-05-15T08:30:00Z",
    updatedAt: "2026-05-15T08:30:00Z"
  },
  {
    id: "art-2",
    title: "5 Tips to Improve Your Daily Mindfulness",
    content: "<p>Mindfulness doesn't have to take hours of your day. Here are 5 quick tips to integrate mindfulness into your busy schedule and reduce daily anxiety.</p>",
    category: "Mindfulness",
    status: "published",
    author: "John Smith",
    createdAt: "2026-05-20T10:15:00Z",
    updatedAt: "2026-05-22T14:20:00Z"
  },
  {
    id: "art-3",
    title: "Building Healthy Boundaries in Relationships",
    content: "<p>Setting boundaries is a crucial aspect of self-care and respect. Let's look at how you can communicate your boundaries assertively and constructively.</p>",
    category: "Relationships",
    status: "draft",
    author: "Jane Doe",
    createdAt: "2026-05-28T16:45:00Z",
    updatedAt: "2026-05-28T16:45:00Z"
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: "usr-1",
    name: "Jane Doe",
    email: "jane.doe@lyfline.com",
    role: "admin",
    createdAt: "2026-01-10T09:00:00Z"
  },
  {
    id: "usr-2",
    name: "John Smith",
    email: "john.smith@lyfline.com",
    role: "editor",
    createdAt: "2026-02-15T10:30:00Z"
  }
];

// Helper to initialize local storage
const initializeDB = () => {
  if (!localStorage.getItem('lyfline_articles')) {
    localStorage.setItem('lyfline_articles', JSON.stringify(DEFAULT_ARTICLES));
  }
  if (!localStorage.getItem('lyfline_users')) {
    localStorage.setItem('lyfline_users', JSON.stringify(DEFAULT_USERS));
  }
};

initializeDB();

export const mockApi = {
  // --- AUTHENTICATION ---
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    const users = JSON.parse(localStorage.getItem('lyfline_users') || '[]') as User[];
    
    // Developer bypass (harmlessly access password to avoid unused var lint warning)
    if (password) {
      // Ignored for development
    }

    // Find existing user or dynamically create a temporary developer user
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      const namePart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      user = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1) || "Developer",
        email: email,
        role: "admin",
        createdAt: new Date().toISOString()
      };
      
      // Save to mock database
      users.push(user);
      localStorage.setItem('lyfline_users', JSON.stringify(users));
    }

    localStorage.setItem('lyfline_token', 'mock-jwt-token-xyz');
    localStorage.setItem('lyfline_current_user', JSON.stringify(user));
    return { token: 'mock-jwt-token-xyz', user };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('lyfline_token');
    localStorage.removeItem('lyfline_current_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('lyfline_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // --- ARTICLES ---
  getArticles: async (): Promise<Article[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return JSON.parse(localStorage.getItem('lyfline_articles') || '[]') as Article[];
  },

  getArticleById: async (id: string): Promise<Article> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const articles = JSON.parse(localStorage.getItem('lyfline_articles') || '[]') as Article[];
    const article = articles.find(a => a.id === id);
    if (!article) throw new Error('Article not found');
    return article;
  },

  createArticle: async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const articles = JSON.parse(localStorage.getItem('lyfline_articles') || '[]') as Article[];
    const newArticle: Article = {
      ...data,
      id: `art-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    articles.unshift(newArticle);
    localStorage.setItem('lyfline_articles', JSON.stringify(articles));
    return newArticle;
  },

  updateArticle: async (id: string, data: Partial<Article>): Promise<Article> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const articles = JSON.parse(localStorage.getItem('lyfline_articles') || '[]') as Article[];
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');

    const updated: Article = {
      ...articles[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    articles[index] = updated;
    localStorage.setItem('lyfline_articles', JSON.stringify(articles));
    return updated;
  },

  deleteArticle: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const articles = JSON.parse(localStorage.getItem('lyfline_articles') || '[]') as Article[];
    const filtered = articles.filter(a => a.id !== id);
    localStorage.setItem('lyfline_articles', JSON.stringify(filtered));
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return JSON.parse(localStorage.getItem('lyfline_users') || '[]') as User[];
  },

  createUser: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('lyfline_users') || '[]') as User[];
    const newUser: User = {
      ...data,
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('lyfline_users', JSON.stringify(users));
    return newUser;
  },

  deleteUser: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const users = JSON.parse(localStorage.getItem('lyfline_users') || '[]') as User[];
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem('lyfline_users', JSON.stringify(filtered));
  }
};
