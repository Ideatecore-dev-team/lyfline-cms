import { useEffect, useState } from "react";
import Button from "../button";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title?: string;
    message?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Remove User",
    message = "Are you sure you want to remove this user? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error("Confirmation error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[500px] p-6 bg-white rounded-[32px] outline -outline-offset-1 outline-slate-200 inline-flex flex-col justify-start items-start gap-6 shadow-2xl animate-scale-in"
            >
                {/* Title Bar */}
                <div className="self-stretch inline-flex justify-between items-start">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            DELETE CONFIRMATION
                        </div>
                        <div className="self-stretch justify-start text-black text-xl font-medium font-sans">
                            {title}
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

                {/* Message Body */}
                <div className="self-stretch text-slate-600 text-sm font-normal font-sans leading-relaxed">
                    {message}
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-200" />

                {/* Action Buttons */}
                <div className="self-stretch inline-flex justify-end items-center gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        text="No"
                        variant="primary"
                        className="w-full px-6 py-2.5 h-11 text-sm rounded-full cursor-pointer active:scale-95"
                    />
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={submitting}
                        text={submitting ? "Confirming..." : "Yes, Continue"}
                        variant="outline-primary"
                        className="w-full px-6 py-2.5 h-11 text-sm rounded-full cursor-pointer active:scale-95"
                    />
                </div>
            </div>
        </div>
    );
}
