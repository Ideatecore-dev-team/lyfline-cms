import { useEffect, useState } from "react";
import { type User } from "../../shared/api/auth";
import InputBox from "../inputbox";
import Button from "../button";

interface ManageUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; role: "super_admin" | "admin" | "editor"; password?: string }) => Promise<void>;
    user?: User | null;
}

export default function ManageUserModal({
    isOpen,
    onClose,
    onSubmit,
    user,
}: ManageUserModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPassword("");
            setConfirmPassword("");
        } else {
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        }
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError("");
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Username is required.");
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        // Password validation: required in Add mode, optional in Edit mode
        if (!user) {
            if (!password) {
                setError("Password is required.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        } else {
            if (password && password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        }

        setSubmitting(true);
        try {
            await onSubmit({
                name,
                email,
                role: "admin", // Always admin when pushed to database
                ...(password ? { password } : {}),
            });
            onClose();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            setError(errMsg || "An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const isEdit = !!user;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[600px] p-6 bg-white rounded-[32px] outline -outline-offset-1 outline-slate-200 inline-flex flex-col justify-start items-start gap-6 shadow-2xl"
            >
                {/* Title Bar */}
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            {isEdit ? "EDIT USER FORM" : "ADD USER FORM"}
                        </div>
                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            User Information
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#9EB7DA] hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center"
                        title="Close"
                    >
                        <span
                            style={{
                                maskImage: 'url("/icons/Close.svg")',
                                WebkitMaskImage: 'url("/icons/Close.svg")',
                            }}
                            className="size-6 bg-slate-500 mask-contain mask-no-repeat mask-center shrink-0"
                            aria-hidden="true"
                        />
                    </button>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {error && (
                    <div className="self-stretch p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                        <span
                            style={{
                                maskImage: 'url("/icons/Danger Circle.svg")',
                                WebkitMaskImage: 'url("/icons/Danger Circle.svg")',
                            }}
                            className="size-5 bg-current mask-contain mask-no-repeat mask-center shrink-0"
                            aria-hidden="true"
                        />
                        <span>{error}</span>
                    </div>
                )}

                {/* Inputs */}
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <InputBox
                        label={
                            <span>
                                Username <span className="text-accent">*</span>
                            </span>
                        }
                        placeholder="Abraham.."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        containerClassName="max-w-none"
                    />

                    <InputBox
                        label={
                            <span>
                                Email <span className="text-accent">*</span>
                            </span>
                        }
                        type="email"
                        placeholder="abraham@lyfline.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        containerClassName="max-w-none"
                    />

                    <InputBox
                        label={
                            <span>
                                Password {!isEdit && <span className="text-accent">*</span>}
                            </span>
                        }
                        type={showPassword ? "text" : "password"}
                        placeholder={isEdit ? "Fill to change password" : "Fill the password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!isEdit}
                        rightIcon={showPassword ? "Hide" : "Show"}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        containerClassName="max-w-none"
                    />

                    <InputBox
                        label={
                            <span>
                                Confirm Password {!isEdit && <span className="text-accent">*</span>}
                            </span>
                        }
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm the password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isEdit}
                        rightIcon={showConfirmPassword ? "Hide" : "Show"}
                        onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        containerClassName="max-w-none"
                    />
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={submitting}
                    text={submitting ? "Saving..." : isEdit ? "Save Changes" : "Add User"}
                    leftIcon="Add"
                    variant="primary"
                    className="w-full self-stretch"
                />
            </form>
        </div>
    );
}
