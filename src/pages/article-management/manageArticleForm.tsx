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
    const [category, setCategory] = useState("Mental Health");
    const [categoryColor, setCategoryColor] = useState("Blue");
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerRemoved, setBannerRemoved] = useState(false);
    const [content, setContent] = useState("");

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
                    setCategory(article.category);
                    setContent(article.content || "");
                    setCategoryColor(article.categoryColor || "Blue");
                    setBannerUrl(article.imageUrl || null);
                    // Ensure the loaded article's category is added to the list of selectable options
                    if (article.category) {
                        setAvailableCategories((prev) => Array.from(new Set([...prev, article.category])));
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

        if (!articleName.trim() || !category || !categoryColor) {
            showNotif("Please fill out all required fields.", "error");
            return;
        }

        if (!bannerUrl && !bannerFile) {
            showNotif("Article Banner is required.", "error");
            return;
        }

        if (!content.trim() || content === "<p><br></p>") {
            showNotif("Article Content is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const articleData = {
                title: articleName.trim(),
                category: category,
                categoryColor: categoryColor,
                content: content,
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
                <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
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
                <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0">
                <Sidebar minimal />
            </div>

            {/* Main Content Card */}
            <div className="flex-1 p-6 bg-white rounded-[32px] inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
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
                                        Article Name <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="e.g. Understanding Mental Health"
                                value={articleName}
                                onChange={(e) => setArticleName(e.target.value)}
                                required
                                containerClassName="max-w-none"
                            />

                            {/* Horizontal Dropdowns: Category & Category Color */}
                            <div className="flex flex-col md:flex-row gap-6 w-full">
                                <Dropdown
                                    label={
                                        <span>
                                            Article Category <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Select Category"
                                    options={availableCategories.map((c) => ({ value: c, label: c }))}
                                    value={category}
                                    onChange={(val) => setCategory(val)}
                                    multiple={false}
                                    allowCustomValues={true}
                                    containerClassName="flex-1 max-w-none"
                                />

                                <Dropdown
                                    label={
                                        <span>
                                            Category Color <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Select Color"
                                    options={[
                                        { value: "Blue", label: <Badge variant="blue" text="Blue" />, searchLabel: "Blue" },
                                        { value: "Green", label: <Badge variant="green" text="Green" />, searchLabel: "Green" },
                                        { value: "Red", label: <Badge variant="red" text="Red" />, searchLabel: "Red" },
                                        { value: "Yellow", label: <Badge variant="yellow" text="Yellow" />, searchLabel: "Yellow" },
                                        { value: "Purple", label: <Badge variant="purple" text="Purple" />, searchLabel: "Purple" },
                                        { value: "Orange", label: <Badge variant="orange" text="Orange" />, searchLabel: "Orange" },
                                    ]}
                                    value={categoryColor}
                                    onChange={(val) => setCategoryColor(val)}
                                    multiple={false}
                                    containerClassName="w-full max-w-none md:w-80 md:max-w-xs shrink-0"
                                    selectClassName="bg-white"
                                />
                            </div>

                            {/* Article Content Editor */}
                            <ArticleEditor
                                label="Article Content"
                                value={content}
                                onChange={setContent}
                                required
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
