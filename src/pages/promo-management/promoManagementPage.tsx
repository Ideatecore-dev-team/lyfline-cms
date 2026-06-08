import { useEffect, useState } from "react";
import Sidebar from "../../widgets/Sidebar";
import UploadFile from "../../component/uploadFile";
import Notification from "../../component/notification";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";
import { uploadPromoImage, deletePromoImage, getPromoImage } from "../../shared/api/promo/promo";

export default function PromoManagementPage() {
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [notification, setNotification] = useState<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "default";
    }>({
        isOpen: false,
        message: "",
        type: "default",
    });

    const showNotif = (message: string, type: "success" | "error" | "default" = "success") => {
        setNotification({
            isOpen: true,
            message,
            type,
        });
    };

    const fetchActiveBanner = async () => {
        setLoading(true);
        setError("");
        try {
            const url = await getPromoImage();
            setCurrentBannerUrl(url);
        } catch (err: any) {
            console.error("Error loading promo banner:", err);
            setError("Failed to fetch current banner from storage.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveBanner();
    }, []);

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;
        setSubmitting(true);
        setError("");
        try {
            const newUrl = await uploadPromoImage(files[0]);
            setCurrentBannerUrl(newUrl);
            showNotif("Promo banner uploaded successfully!", "success");
            // Refresh to update active display
            await fetchActiveBanner();
        } catch (err: any) {
            const errMsg = err.message || "Failed to upload promo image.";
            setError(errMsg);
            showNotif(errMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveActive = () => {
        if (!currentBannerUrl) return;
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!currentBannerUrl) return;
        setSubmitting(true);
        setError("");
        try {
            await deletePromoImage(currentBannerUrl);
            setCurrentBannerUrl(null);
            showNotif("Promo banner deleted successfully.", "success");
        } catch (err: any) {
            const errMsg = "Failed to delete promo banner: " + err.message;
            setError(errMsg);
            showNotif(errMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0">
                <Sidebar minimal />
            </div>

            {/* Main Content Card */}
            <div className="flex-1 p-6 bg-white rounded-[32px] inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Header Block */}
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-primary text-3xl font-medium font-['Poppins']">
                            Manage Promo
                        </div>
                        <div className="justify-start">
                            <span className="text-black text-sm font-normal font-['Poppins']">
                                Manage promo on home page-hero section here.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Error Banner */}
                {error && (
                    <div className="self-stretch p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Upload Section */}
                {loading ? (
                    <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                        Checking storage bucket...
                    </div>
                ) : (
                    <div className="self-stretch">
                        {submitting && (
                            <div className="mb-4">
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full animate-loading-progress" />
                                </div>
                                <div className="text-xs text-primary mt-2 font-sans font-medium animate-pulse text-center">
                                    Processing storage file...
                                </div>
                            </div>
                        )}
                        <UploadFile
                            label={
                                <span>
                                    Banner Promo Image <span className="text-red-500">*</span>
                                </span>
                            }
                            descriptionPrefix="Preferable Size"
                            descriptionValue="(736px * 448px)"
                            multiple={false}
                            defaultImageUrl={currentBannerUrl || undefined}
                            onRemoveDefaultImage={handleRemoveActive}
                            onChange={async (files) => {
                                if (files.length > 0) {
                                    await handleUpload(files);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Promo Banner"
                message="Are you sure you want to remove the current promo banner? This action will permanently clear it from storage."
            />

            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
