import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import Notification from "../../component/notification";
import { authApi } from "../../shared/api/auth";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      setSuccess("Successfully logged in!");
      setTimeout(() => {
        if (response.user.role === "super_admin") {
          navigate("/cms/users");
        } else {
          navigate("/cms/promo");
        }
      }, 1200);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: "#ECF1F8" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[466px] p-6 bg-white rounded-[32px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.10)] flex flex-col justify-start items-stretch gap-5"
      >
        {/* Logo */}
        <div className="w-24 h-12 relative overflow-hidden flex items-center">
          <img
            className="w-24 h-8 object-contain"
            src="/Lyfline-Logo.svg"
            alt="Lyfline Logo"
          />
        </div>

        {/* Header Text */}
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="justify-start text-[#95B0D7] text-sm font-normal tracking-wider font-sans uppercase">
            LOGIN TO THE SYSTEM
          </div>
          <div className="justify-start text-primary text-3xl font-medium font-sans leading-tight">
            Content Management System
          </div>
        </div>

        <Notification
          isOpen={!!error}
          message={error}
          type="error"
          onClose={() => setError("")}
        />
        <Notification
          isOpen={!!success}
          message={success}
          type="success"
          onClose={() => setSuccess("")}
        />

        {/* Input Fields */}
        <div className="flex flex-col gap-4">
          <InputBox
            label="Email"
            placeholder="your@mail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            containerClassName="max-w-none"
          />

          <InputBox
            label="Password"
            placeholder="Input your password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            rightIcon={showPassword ? "Hide" : "Show"}
            onRightIconClick={() => setShowPassword(!showPassword)}
            containerClassName="max-w-none"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-1 self-stretch"></div>

        {/* Submit Action */}
        <Button
          text={loading ? "Logging in..." : "Login"}
          rightIcon="Login"
          variant="primary"
          className="w-full self-stretch"
          type="submit"
          disabled={loading}
        />

        {/* Forget Password Note */}
        <div className="text-center text-[#95B0D7] text-sm font-normal font-sans">
          Forget your password? please contact the admin.
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
