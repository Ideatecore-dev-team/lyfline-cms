import { useEffect, useState } from "react";
import Sidebar from "../../widgets/Sidebar";
import UploadFile from "../../component/uploadFile";
import Notification from "../../component/notification";
import InputBox from "../../component/inputbox";
import Button from "../../component/button";
import { uploadPromoImage, deletePromoImage, getPromoSettings, savePromoSettings } from "../../shared/api/promo/promo";

export default function PromoManagementPage() {
    const [originalBannerUrl, setOriginalBannerUrl] = useState<string | null>(null);
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
    const [destinationLink, setDestinationLink] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    const fetchPromoSettings = async () => {
        setLoading(true);
        setError("");
        try {
            const { imageUrl, destinationLink: link } = await getPromoSettings();
            setCurrentBannerUrl(imageUrl);
            setOriginalBannerUrl(imageUrl);
            setDestinationLink(link || "");
        } catch (err: any) {
            console.error("Error loading promo settings:", err);
            setError("Failed to fetch current promo settings from database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromoSettings();
    }, []);

    const handleRemoveActive = () => {
        setCurrentBannerUrl(null);
        setSelectedFile(null);
        setIsImageRemoved(true);
    };

    const handleSave = async () => {
        setSubmitting(true);
        setError("");
        try {
            let finalUrl = currentBannerUrl;

            // 1. If an image was removed, or a new file is being uploaded, delete the old image from the storage bucket
            if (isImageRemoved || selectedFile) {
                if (originalBannerUrl) {
                    await deletePromoImage(originalBannerUrl);
                }
                finalUrl = null;
            }

            // 2. If a new file was chosen, upload it
            if (selectedFile) {
                const uploadedUrl = await uploadPromoImage(selectedFile);
                finalUrl = uploadedUrl;
            }

            // 3. Save both keys to settings table
            await savePromoSettings(finalUrl, destinationLink.trim());

            // 4. Update states to match saved values
            setOriginalBannerUrl(finalUrl);
            setCurrentBannerUrl(finalUrl);
            setSelectedFile(null);
            setIsImageRemoved(false);

            showNotif("Promo settings saved successfully!", "success");
        } catch (err: any) {
            console.error("Error saving promo settings:", err);
            const errMsg = err.message || "Failed to save promo settings.";
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

                {/* Settings Form Section */}
                {loading ? (
                    <div className="self-stretch p-12 text-center text-slate-400 font-sans">
                        Loading promo settings...
                    </div>
                ) : (
                    <div className="self-stretch w-full flex flex-col gap-6">
                        {submitting && (
                            <div className="w-full">
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full animate-loading-progress" />
                                </div>
                                <div className="text-xs text-primary mt-2 font-sans font-medium animate-pulse text-center">
                                    Saving promo settings...
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-5 w-full">
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
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        setSelectedFile(files[0]);
                                        setCurrentBannerUrl(URL.createObjectURL(files[0]));
                                        setIsImageRemoved(false);
                                    } else {
                                        setSelectedFile(null);
                                        setCurrentBannerUrl(null);
                                        setIsImageRemoved(true);
                                    }
                                }}
                            />

                            <InputBox
                                label="Destination Link"
                                placeholder="e.g. https://wa.me/628123456789?text=I+am+interested+in+the+promo"
                                value={destinationLink}
                                onChange={(e) => setDestinationLink(e.target.value)}
                                containerClassName="w-full max-w-none animate-in fade-in-50 duration-200"
                            />
                        </div>

                        {/* Divider */}
                        <div className="self-stretch h-px bg-slate-100" />

                        {/* Save Button */}
                        <div className="self-stretch flex justify-end items-center">
                            <Button
                                onClick={handleSave}
                                disabled={submitting}
                                text={submitting ? "Saving..." : "Save Promo"}
                                variant="primary"
                                className="w-full sm:w-40"
                            />
                        </div>
                    </div>
                )}
            </div>

            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
