import { useEffect, useState } from "react";
import Sidebar from "../../widgets/Sidebar";
import UploadFile from "../../component/uploadFile";
import { uploadPromoImage, deletePromoImage, getPromoImage } from "../../shared/api/promo/promo";

export default function PromoManagementPage() {
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
            alert("Promo banner uploaded successfully!");
            // Refresh to update active display
            await fetchActiveBanner();
        } catch (err: any) {
            setError(err.message || "Failed to upload promo image.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveActive = async () => {
        if (!currentBannerUrl) return;
        if (window.confirm("Are you sure you want to remove the current promo banner? This will clear it from storage.")) {
            setSubmitting(true);
            setError("");
            try {
                await deletePromoImage(currentBannerUrl);
                setCurrentBannerUrl(null);
                alert("Promo banner deleted successfully.");
            } catch (err: any) {
                setError("Failed to delete promo banner: " + err.message);
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <Sidebar minimal />

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
                        {submitting && (
                            <div className="text-xs text-[#3F71B7] mt-2 font-sans font-medium animate-pulse">
                                Processing storage file...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
