import { useEffect, useState } from "react";
import { FiTrash2, FiUserPlus, FiAlertCircle, FiX } from "react-icons/fi";
import { mockApi, type User } from "../../shared/api/mockApi";

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User | null>(() => mockApi.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchUsers();
    }, 0);
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("A valid email address is required.");
      return;
    }

    setSubmitting(true);
    try {
      await mockApi.createUser({
        name,
        email,
        role,
      });

      // Clear form and reload
      setName("");
      setEmail("");
      setRole("editor");
      setShowAddModal(false);
      fetchUsers();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    // Prevent deleting oneself
    if (currentUser && currentUser.id === id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove administrator "${userName}"?`)) {
      try {
        await mockApi.deleteUser(id);
        fetchUsers();
      } catch {
        alert("Failed to delete user.");
      }
    }
  };

  // Block non-admin roles completely from viewing this page
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border border-neutral-light shadow-sm p-8 text-center animate-fade-in-up">
        <div className="p-4 bg-accent/10 rounded-full text-accent mb-4">
          <FiAlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-neutral-dark">Access Denied</h2>
        <p className="text-sm text-neutral-muted max-w-sm mt-2">
          You do not have the required administrative permissions to manage portal accounts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-light shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-dark">
            User Management
          </h1>
          <p className="text-sm text-neutral-muted">
            Manage portal administrative accounts and control system access.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm"
        >
          <FiUserPlus className="w-4 h-4" />
          <span>Add Admin Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-light/30 border-b border-neutral-light text-neutral-muted font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Date Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-light/10 transition-colors text-sm text-neutral-dark">
                  <td className="py-4 px-6 font-bold">{user.name}</td>
                  <td className="py-4 px-6">{user.email}</td>
                  <td className="py-4 px-6 capitalize">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                      user.role === 'admin'
                        ? "bg-primary/10 text-primary"
                        : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={currentUser?.id === user.id}
                      title="Remove Account"
                      className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-muted hover:text-accent hover:bg-accent/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-muted"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-dark/40 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-neutral-light shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-neutral-light flex justify-between items-center bg-neutral-light/20">
              <h3 className="font-extrabold text-neutral-dark text-lg flex items-center gap-2">
                <FiUserPlus className="text-primary" />
                <span>Add Admin Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-muted hover:bg-neutral-light/50 hover:text-neutral-dark transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {error && (
                <div className="p-4 rounded-xl bg-accent-light/10 border border-accent/20 text-accent text-sm font-medium flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane.doe@lyfline.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "editor")}
                  className="block w-full px-4 py-2.5 border border-neutral-light rounded-xl text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                >
                  <option value="editor">Editor (Create & Edit Content)</option>
                  <option value="admin">Administrator (Full System Control)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-light text-neutral-muted hover:bg-neutral-light/30 hover:text-neutral-dark transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition-all text-sm disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
