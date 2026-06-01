import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiArrowLeft, FiSave, FiAlertCircle } from "react-icons/fi";
import { mockApi, type Article, type User } from "../../shared/api/mockApi";

function ArticleManagementPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentUser] = useState<User | null>(() => mockApi.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [view, setView] = useState<"list" | "form">("list");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mental Health");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getArticles();
      setArticles(data);
    } catch (err) {
      console.error("Error loading articles", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch articles on mount
  useEffect(() => {
    setTimeout(() => {
      fetchArticles();
    }, 0);
  }, []);

  // Switch to Add Form
  const handleAddClick = () => {
    setEditingArticle(null);
    setTitle("");
    setCategory("Mental Health");
    setStatus("draft");
    setContent("");
    setFormError("");
    setView("form");
  };

  // Switch to Edit Form
  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategory(article.category);
    setStatus(article.status);
    setContent(article.content);
    setFormError("");
    setView("form");
  };

  // Submit Form (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      setFormError("Content body is required.");
      return;
    }

    setSubmitting(true);
    try {
      const authorName = currentUser?.name || "Administrator";
      
      if (editingArticle) {
        // Update
        await mockApi.updateArticle(editingArticle.id, {
          title,
          category,
          status,
          content,
        });
      } else {
        // Create
        await mockApi.createArticle({
          title,
          category,
          status,
          content,
          author: authorName,
        });
      }
      
      // Reset view and reload
      setView("list");
      fetchArticles();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setFormError(errMsg || "Failed to save article.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Article
  const handleDeleteClick = async (id: string, articleTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${articleTitle}"?`)) {
      try {
        await mockApi.deleteArticle(id);
        fetchArticles();
      } catch {
        alert("Failed to delete article.");
      }
    }
  };

  // Filter articles by search query
  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quill styling modules
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  if (loading && view === "list") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {view === "list" ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-light shadow-sm">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-dark">
                Article Management
              </h1>
              <p className="text-sm text-neutral-muted">
                Create, edit, and publish articles for Lyfline.
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
          </div>

          {/* Search/Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-light shadow-sm flex items-center gap-3">
            <FiSearch className="text-neutral-muted w-5 h-5 ml-2" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full border-0 focus:outline-none focus:ring-0 text-sm text-neutral-dark placeholder-neutral-muted/70"
            />
          </div>

          {/* Articles Table Card */}
          <div className="bg-white rounded-2xl border border-neutral-light shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-light/30 border-b border-neutral-light text-neutral-muted font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Author</th>
                    <th className="py-4 px-6">Date Created</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-neutral-light/10 transition-colors text-sm text-neutral-dark">
                      <td className="py-4 px-6 font-bold max-w-xs truncate">{article.title}</td>
                      <td className="py-4 px-6">
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                          {article.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">{article.author}</td>
                      <td className="py-4 px-6">
                        {new Date(article.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          article.status === 'published'
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(article)}
                          title="Edit Article"
                          className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-muted hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(article.id, article.title)}
                          title="Delete Article"
                          className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-muted hover:text-accent hover:bg-accent/10 transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-muted">
                        No articles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Form View */
        <div className="bg-white rounded-2xl border border-neutral-light shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="p-6 border-b border-neutral-light flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("list")}
                className="p-2 rounded-lg text-neutral-muted hover:bg-neutral-light/50 hover:text-neutral-dark transition-all"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-extrabold text-neutral-dark">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </h2>
            </div>
            {editingArticle && (
              <span className="text-xs text-neutral-muted uppercase tracking-wider font-semibold">
                ID: {editingArticle.id}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Form Error */}
            {formError && (
              <div className="p-4 rounded-xl bg-accent-light/10 border border-accent/20 text-accent text-sm font-medium flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                Article Title
              </label>
              <input
                type="text"
                placeholder="Enter a compelling title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
              />
            </div>

            {/* Grid for Category and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-3 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="Mental Health">Mental Health</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Health">Health</option>
                  <option value="Parenting">Parenting</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                  className="block w-full px-4 py-3 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                Article Body
              </label>
              <div className="rounded-xl border border-neutral-light overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  placeholder="Start writing your article..."
                  className="h-80 bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-neutral-muted">
                Use the toolbar above to style headings, lists, links, and text attributes.
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-neutral-light flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-5 py-2.5 rounded-xl border border-neutral-light text-neutral-muted hover:bg-neutral-light/30 hover:text-neutral-dark transition-all text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Save Article</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ArticleManagementPage;
