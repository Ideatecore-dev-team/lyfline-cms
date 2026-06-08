import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiCheckCircle, FiEdit3, FiUsers, FiPlus } from "react-icons/fi";
import { mockApi, type Article, type User } from "../../shared/api/mockApi";

function DashboardPage() {
  const [currentUser] = useState<User | null>(() => mockApi.getCurrentUser());
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, usersData] = await Promise.all([
          mockApi.getArticles(),
          mockApi.getUsers()
        ]);
        setArticles(articlesData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;
  const totalUsers = users.length;

  const stats = [
    {
      label: "Total Articles",
      value: totalArticles,
      icon: <span className="text-primary"><FiFileText size={24} /></span>,
      bgColor: "bg-primary/10",
    },
    {
      label: "Published",
      value: publishedArticles,
      icon: <span className="text-green-600"><FiCheckCircle size={24} /></span>,
      bgColor: "bg-green-50",
    },
    {
      label: "Drafts",
      value: draftArticles,
      icon: <span className="text-amber-600"><FiEdit3 size={24} /></span>,
      bgColor: "bg-amber-50",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: <span className="text-indigo-600"><FiUsers size={24} /></span>,
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-light shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-dark">
            Welcome back, <span className="text-primary">{currentUser?.name}</span>!
          </h1>
          <p className="text-sm text-neutral-muted">
            Here's what's happening with Lyfline portal today.
          </p>
        </div>
        <Link
          to="/cms/article"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
        >
          <span className="flex items-center"><FiPlus size={16} /></span>
          <span>New Article</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-light shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-extrabold text-neutral-dark">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.bgColor}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-light shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-light flex justify-between items-center">
            <h3 className="text-lg font-bold text-neutral-dark">Recent Articles</h3>
            <Link to="/cms/article" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-neutral-light">
            {articles.slice(0, 3).map((article) => (
              <div key={article.id} className="p-6 flex items-start justify-between hover:bg-neutral-light/20 transition-colors">
                <div>
                  <h4 className="font-bold text-neutral-dark hover:text-primary transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex gap-3 mt-2 text-xs text-neutral-muted">
                    <span className="bg-primary-light text-primary px-2 py-0.5 rounded font-medium">
                      {article.category}
                    </span>
                    <span>By {article.author}</span>
                    <span>• {new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  article.status === 'published'
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {article.status}
                </span>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="p-8 text-center text-neutral-muted text-sm">
                No articles created yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / System Info */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-dark mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                to="/cms/article"
                className="flex items-center gap-3 p-3 border border-neutral-light rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="flex items-center"><FiFileText size={20} /></span>
                </div>
                <div className="text-left">
                  <h5 className="font-semibold text-neutral-dark text-sm">Manage Articles</h5>
                  <p className="text-xs text-neutral-muted">Create & update public articles</p>
                </div>
              </Link>

              {currentUser?.role === 'admin' && (
                <Link
                  to="/cms/users"
                  className="flex items-center gap-3 p-3 border border-neutral-light rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <span className="flex items-center"><FiUsers size={20} /></span>
                  </div>
                  <div className="text-left">
                    <h5 className="font-semibold text-neutral-dark text-sm">Manage Users</h5>
                    <p className="text-xs text-neutral-muted">Add or remove CMS administrators</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-light text-center">
            <span className="text-xs text-neutral-muted">
              Lyfline Portal Version 1.0.0 (Local Preview)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
