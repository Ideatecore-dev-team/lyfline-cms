import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../shared/api/auth";
import { getArticleById, addArticle, editArticle, getConsistingCategories } from "../../shared/api/article";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import UploadFile from "../../component/uploadFile";
import Dropdown from "../../component/dropdown";
import Badge from "../../component/badge";
import ArticleEditor from "../../component/articleEditor";
import Notification from "../../component/notification";

const Icon = ({ name, className = "size-5 bg-current" }: { name: string; className?: string }) => (
    <span
        style={{
            maskImage: `url("/icons/${name}.svg")`,
            WebkitMaskImage: `url("/icons/${name}.svg")`,
        }}
        className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
        aria-hidden="true"
    />
);

const DEFAULT_CATEGORIES = ["Mental Health", "Mindfulness", "Relationships", "Health", "Parenting"];

export default function ManageArticleForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [currentUser] = useState(() => authApi.getCurrentUser());

    const [articleName, setArticleName] = useState("");
    const [articleNameIndonesia, setArticleNameIndonesia] = useState("");
    const [categories, setCategories] = useState<string[]>(["Mental Health"]);
    const [categoryColors, setCategoryColors] = useState<string[]>(["Blue"]);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerRemoved, setBannerRemoved] = useState(false);
    const [content, setContent] = useState("");
    const [contentIndonesia, setContentIndonesia] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_CATEGORIES);

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

    // Load existing categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const existing = await getConsistingCategories();
                const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...existing]));
                setAvailableCategories(merged);
            } catch (err) {
                console.error("Error loading categories", err);
            }
        };
        loadCategories();
    }, []);

    // Load existing article info if in edit mode
    useEffect(() => {
        if (!id) return;

        const loadArticle = async () => {
            setLoading(true);
            try {
                const article = await getArticleById(id);
                if (article) {
                    setArticleName(article.title);
                    setArticleNameIndonesia(article.titleIndonesia || "");
                    setCategories(article.category && article.category.length > 0 ? article.category : ["Mental Health"]);
                    setCategoryColors(article.categoryColor && article.categoryColor.length > 0 ? article.categoryColor : ["Blue"]);
                    setContent(article.content || "");
                    setContentIndonesia(article.contentIndonesia || "");
                    setBannerUrl(article.imageUrl || null);
                    // Ensure the loaded article's category is added to the list of selectable options
                    if (article.category && article.category.length > 0) {
                        setAvailableCategories((prev) => {
                            const newCategories = article.category.filter((cat) => !prev.includes(cat));
                            return Array.from(new Set([...prev, ...newCategories]));
                        });
                    }
                } else {
                    showNotif("Article not found.", "error");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to load article details.";
                showNotif(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validCategories = categories.map(c => c.trim()).filter(Boolean);
        const validColors = categoryColors.map(c => c.trim()).filter(Boolean);

        if (!articleName.trim() || validCategories.length === 0 || validColors.length === 0) {
            showNotif("Please fill out all required fields.", "error");
            return;
        }

        if (!bannerUrl && !bannerFile) {
            showNotif("Article Banner is required.", "error");
            return;
        }

        if (!content.trim() || content === "<p><br></p>") {
            showNotif("Article Content (English) is required.", "error");
            return;
        }

        if (!contentIndonesia.trim() || contentIndonesia === "<p><br></p>") {
            showNotif("Article Content (Bahasa Indonesia) is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const articleData = {
                title: articleName.trim(),
                titleIndonesia: articleNameIndonesia.trim(),
                category: validCategories,
                categoryColor: validColors,
                content: content,
                contentIndonesia: contentIndonesia,
            };

            const msg = id
                ? `Article "${articleName.trim()}" updated successfully!`
                : `Article "${articleName.trim()}" added successfully!`;

            if (id) {
                await editArticle(id, articleData, bannerFile, bannerRemoved);
            } else {
                await addArticle(articleData, bannerFile);
            }

            // Return to articles list page
            navigate("/cms/article", { state: { successMessage: msg } });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save article.";
            showNotif(errorMessage, "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (currentUser && currentUser.role !== "super_admin" && currentUser.role !== "admin") {
        return (
            <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
                <div className="hidden lg:block shrink-0">
                    <Sidebar minimal />
                </div>
                <div className="flex-1 p-8 bg-white rounded-4xl flex flex-col items-center justify-center min-h-100 border border-gray-100 shadow-sm text-center">
                    <div className="p-4 bg-red-50 rounded-full text-red-500 mb-4">
                        <Icon name="Danger Circle" className="size-12 bg-current" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 font-sans">Access Denied</h2>
                    <p className="text-sm text-slate-500 max-w-sm mt-2 font-sans">
                        You do not have the required administrative permissions to manage articles.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
                <div className="hidden lg:block shrink-0">
                    <Sidebar minimal />
                </div>
                <div className="flex-1 p-8 bg-white rounded-4xl flex flex-col items-center justify-center min-h-100 border border-gray-100 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0 sticky top-0 self-start z-10">
                <Sidebar minimal />
            </div>

            {/* Main Content Card */}
            <div className="flex-1 p-6 bg-white rounded-4xl inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Back Button */}
                <Button
                    onClick={() => navigate("/cms/article")}
                    text="Back"
                    leftIcon="Left 1"
                    variant="ghost-black"
                />

                {/* Header Block */}
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-[#9EB7DA] text-sm font-normal font-sans tracking-wider uppercase">
                            ARTICLE FORM
                        </div>
                        <div className="self-stretch justify-start text-black text-2xl font-medium font-sans">
                            Article Information
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />



                {/* Content Area - Full Width */}
                <div className="self-stretch">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="flex flex-col gap-4">
                            {/* Article Banner Upload */}
                            <UploadFile
                                label={
                                    <span>
                                        Article Banner <span className="text-red-500">*</span>
                                    </span>
                                }
                                descriptionPrefix="Preferable Size"
                                descriptionValue="(736px * 448px)"
                                multiple={false}
                                defaultImageUrl={bannerUrl || undefined}
                                defaultImageLabel="Current Article Banner"
                                onRemoveDefaultImage={() => {
                                    setBannerUrl(null);
                                    setBannerFile(null);
                                    setBannerRemoved(true);
                                }}
                                onChange={(files) => {
                                    if (files.length > 0) {
                                        setBannerFile(files[0]);
                                        setBannerUrl(URL.createObjectURL(files[0]));
                                        setBannerRemoved(false);
                                    } else {
                                        setBannerFile(null);
                                        setBannerUrl(null);
                                        setBannerRemoved(true);
                                    }
                                }}
                            />

                            {/* Article Name Input */}
                            <InputBox
                                label={
                                    <span>
                                        Article Name (English) <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Understanding Mental Health"
                                value={articleName}
                                onChange={(e) => setArticleName(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Article Name (Bahasa Indonesia) Input */}
                            <InputBox
                                label={
                                    <span>
                                        Article Name (Bahasa Indonesia) <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="mis. Memahami Kesehatan Mental"
                                value={articleNameIndonesia}
                                onChange={(e) => setArticleNameIndonesia(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Dynamic Categories & Colors */}
                            <div className="flex flex-col gap-3 w-full">
                                <div className="self-stretch px-2.5 py-2.5 bg-primary/10 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6">
                                    <div className="w-full sm:w-121.5 flex justify-start items-center gap-3">
                                        <Icon name="Document Align Left 5" className="size-5 bg-primary" />
                                        <div className="justify-start">
                                            <span className="text-primary text-base font-medium font-sans">Article Categories</span>
                                            <span className="text-[#9EB7DA] text-base font-medium font-sans"> (Can be multiple)</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCategories([...categories, "Mental Health"]);
                                            setCategoryColors([...categoryColors, "Blue"]);
                                        }}
                                        className="h-9 w-full sm:w-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg outline-1 -outline-offset-1 outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95 shrink-0"
                                        title="Add Category"
                                    >
                                        <Icon name="Add" className="size-5 bg-slate-500" />
                                    </button>
                                </div>

                                {categories.length === 0 ? (
                                    <div className="self-stretch text-slate-400 text-sm font-normal font-sans pl-8 py-2">
                                        To add Category click on the <span className="text-primary font-medium">Plus</span> Icon Button
                                    </div>
                                ) : (
                                    categories.map((cat, index) => (
                                        <div key={index} className="self-stretch flex flex-col md:flex-row items-stretch md:items-end gap-4 w-full pl-8 animate-in fade-in-50 duration-200">
                                            <Dropdown
                                                label={<span>Category {index + 1} <span className="text-red-500">*</span></span>}
                                                placeholder="Select Category"
                                                options={availableCategories.map((c) => ({ value: c, label: c }))}
                                                value={cat}
                                                onChange={(val) => {
                                                    const updated = [...categories];
                                                    updated[index] = val;
                                                    setCategories(updated);
                                                }}
                                                multiple={false}
                                                allowCustomValues={true}
                                                containerClassName="flex-1 max-w-none"
                                            />

                                            <Dropdown
                                                label={<span>Color {index + 1} <span className="text-red-500">*</span></span>}
                                                placeholder="Select Color"
                                                options={[
                                                    { value: "Blue", label: <Badge variant="blue" text="Blue" />, searchLabel: "Blue" },
                                                    { value: "Green", label: <Badge variant="green" text="Green" />, searchLabel: "Green" },
                                                    { value: "Red", label: <Badge variant="red" text="Red" />, searchLabel: "Red" },
                                                    { value: "Yellow", label: <Badge variant="yellow" text="Yellow" />, searchLabel: "Yellow" },
                                                    { value: "Purple", label: <Badge variant="purple" text="Purple" />, searchLabel: "Purple" },
                                                    { value: "Orange", label: <Badge variant="orange" text="Orange" />, searchLabel: "Orange" },
                                                ]}
                                                value={categoryColors[index] || "Blue"}
                                                onChange={(val) => {
                                                    const updated = [...categoryColors];
                                                    updated[index] = val;
                                                    setCategoryColors(updated);
                                                }}
                                                multiple={false}
                                                containerClassName="w-full max-w-none md:w-64 md:max-w-xs shrink-0"
                                                selectClassName="bg-white"
                                            />

                                            <div className="h-12 flex items-center shrink-0 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCategories(categories.filter((_, i) => i !== index));
                                                        setCategoryColors(categoryColors.filter((_, i) => i !== index));
                                                    }}
                                                    className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                    title="Delete Category"
                                                >
                                                    <Icon name="Delete 2" className="size-5 bg-current" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Article Content Editor */}
                            <ArticleEditor
                                label="Article Content"
                                englishValue={content}
                                onEnglishChange={setContent}
                                indonesianValue={contentIndonesia}
                                onIndonesianChange={setContentIndonesia}
                                className="mb-6 sm:mb-0"
                            />
                        </div>

                        <div className="self-stretch h-px bg-slate-100" />

                        {/* Action Buttons */}
                        <div className="self-stretch flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 w-full">
                            <Button
                                type="button"
                                onClick={() => navigate("/cms/article")}
                                text="Cancel"
                                variant="outline-primary"
                                className="w-full sm:w-36"
                            />
                            <Button
                                type="submit"
                                disabled={submitting}
                                text={submitting ? "Saving..." : "Save Article"}
                                variant="primary"
                                className="w-full sm:w-40"
                            />
                        </div>
                    </form>
                </div>
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
