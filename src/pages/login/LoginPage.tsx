import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { mockApi } from "../../shared/api/mockApi";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password"); // pre-filled for convenience
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await mockApi.login(email, password);
      // Success! Token is set in localStorage by mockApi
      navigate("/cms/dashboard");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-light/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-light overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Decorative top strip */}
        <div className="h-2 bg-linear-to-r from-primary to-primary-accent" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-dark">
              Lyfline<span className="text-accent">CMS</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-muted">
              Manage your content, articles, and portal administrators.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-accent-light/10 border border-accent/20 text-accent text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-muted">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane.doe@lyfline.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-light rounded-xl text-neutral-dark placeholder-neutral-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-muted">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-light rounded-xl text-neutral-dark placeholder-neutral-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Mock credentials reminder */}
          <div className="mt-8 pt-6 border-t border-neutral-light text-center">
            <h5 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">
              Demo Credentials
            </h5>
            <div className="text-xs text-neutral-muted space-y-1">
              <p>Email: <span className="font-semibold text-primary">jane.doe@lyfline.com</span> (Admin)</p>
              <p>Email: <span className="font-semibold text-primary">john.smith@lyfline.com</span> (Editor)</p>
              <p>Password: <span className="font-semibold text-primary">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
