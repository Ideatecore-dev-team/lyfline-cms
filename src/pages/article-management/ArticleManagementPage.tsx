import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type Article, getArticles, deleteArticle } from "../../shared/api/article";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import InputBox from "../../component/inputbox";
import Dropdown from "../../component/dropdown";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";
import Badge, { type BadgeVariant } from "../../component/badge";
import Notification from "../../component/notification";
import Pagination from "../../component/pagination";

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

const getBadgeVariant = (color?: string): BadgeVariant => {
    if (!color) return "green";
    const normalized = color.toLowerCase();
    const validVariants: BadgeVariant[] = ["green", "red", "blue", "yellow", "purple", "gray", "indigo", "orange"];
    return validVariants.includes(normalized as BadgeVariant) ? (normalized as BadgeVariant) : "green";
};

function ArticleManagementPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [articles, setArticles] = useState<Article[]>([]);
    const [totalArticles, setTotalArticles] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    useEffect(() => {
        if (location.state?.successMessage) {
            showNotif(location.state.successMessage, "success");
            // Clear history state to prevent re-triggering on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Filter states
    const [filterName, setFilterName] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterSort, setFilterSort] = useState("newest");

    // Form / Navigation states
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

    const fetchArticles = useCallback(async (
        page: number,
        titleFilter: string,
        categoryFilter: string,
        sortFilter: string
    ) => {
        setLoading(true);
        try {
            const res = await getArticles({
                title: titleFilter,
                category: categoryFilter,
                sort: sortFilter,
                page,
                limit: itemsPerPage,
            });
            setArticles(res.data);
            setTotalArticles(res.meta.total);
        } catch (err) {
            console.error("Error loading articles", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1);
            fetchArticles(1, filterName, filterCategory, filterSort);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filterName, filterCategory, filterSort, fetchArticles]);

    useEffect(() => {
        fetchArticles(currentPage, filterName, filterCategory, filterSort);
    }, [currentPage, filterName, filterCategory, filterSort, fetchArticles]);

    const handleAddClick = () => {
        navigate("/cms/article/add");
    };

    const handleEditClick = (article: Article) => {
        navigate(`/cms/article/edit/${article.id}`);
    };

    const handleDeleteClick = (article: Article) => {
        setArticleToDelete(article);
    };

    const handleConfirmDelete = async () => {
        if (!articleToDelete) return;
        try {
            await deleteArticle(articleToDelete.id);
            showNotif(`Article "${articleToDelete.title}" deleted successfully!`, "success");
            setArticleToDelete(null);
            fetchArticles(currentPage, filterName, filterCategory, filterSort);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showNotif("Failed to delete article: " + errorMessage, "error");
        }
    };

    // Calculate unique categories dynamically
    const categories = Array.from(
        new Set([...DEFAULT_CATEGORIES, ...articles.map((a) => a.category)])
    ).filter(Boolean);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
            {/* Left Sidebar */}
            <div className="hidden lg:block shrink-0 sticky top-0 self-start z-10">
                <Sidebar minimal />
            </div>

            <div className="flex-1 h-205 p-6 bg-white rounded-4xl flex flex-col justify-start items-stretch gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
                {/* Header Block */}
                <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-4 sm:gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="self-stretch justify-start text-primary text-3xl font-medium font-['Poppins']">
                            Manage Articles
                        </div>
                        <div className="justify-start">
                            <span className="text-black text-sm font-normal font-['Poppins']">
                                Manage articles and categories on this page
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                        <Button
                            onClick={handleAddClick}
                            text="Add Article"
                            leftIcon="Add"
                            className="w-full sm:w-auto"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="self-stretch h-px bg-slate-100" />

                {/* Filters */}
                <div className="self-stretch flex flex-col md:flex-row md:items-end items-stretch gap-4 w-full">
                    <InputBox
                        label="Article Name"
                        placeholder="Search article name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        containerClassName="w-full max-w-none md:w-1/4 md:min-w-[240px]"
                    />
                    <Dropdown
                        label="Category"
                        placeholder="All Categories"
                        options={[
                            { value: "", label: "All Categories" },
                            ...categories.map((c) => ({ value: c, label: c })),
                        ]}
                        value={filterCategory}
                        onChange={(val) => setFilterCategory(val)}
                        multiple={false}
                        containerClassName="w-full max-w-none md:flex-1 md:min-w-[280px]"
                    />
                    <Dropdown
                        label="Sort By"
                        placeholder="Newest to Oldest"
                        options={[
                            { value: "newest", label: "Newest to Oldest" },
                            { value: "oldest", label: "Oldest to Newest" },
                            { value: "updated", label: "Updated Recently" },
                        ]}
                        value={filterSort}
                        onChange={(val) => setFilterSort(val)}
                        multiple={false}
                        containerClassName="w-full max-w-none md:flex-1 md:min-w-[280px]"
                    />
                </div>

                {/* Table Container */}
                <div className="w-full flex-1 bg-white flex flex-col justify-start items-stretch gap-0 overflow-hidden">
                    <div className="w-full flex-1 overflow-x-auto">
                        <div className="min-w-225 flex flex-col items-stretch gap-0">
                            {/* Table Header */}
                            <div className="w-full h-9 rounded-sm flex justify-start items-stretch overflow-hidden bg-indigo-50">
                                <div className="w-16 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            No.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center items-start min-w-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden min-w-0">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins'] truncate">
                                            Article Name
                                        </div>
                                    </div>
                                </div>
                                <div className="w-44 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Category
                                        </div>
                                    </div>
                                </div>
                                <div className="w-40 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Date Created
                                        </div>
                                    </div>
                                </div>
                                <div className="w-40 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Date Updated
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28 flex flex-col justify-center items-start shrink-0">
                                    <div className="w-full flex-1 px-3 py-4 flex justify-start items-center gap-2 overflow-hidden">
                                        <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                                            Action
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Body */}
                            {loading ? (
                                <div className="w-full p-12 text-center text-slate-400 font-sans">
                                    Loading articles...
                                </div>
                            ) : articles.length === 0 ? (
                                <div className="w-full p-12 text-center text-slate-400 font-sans">
                                    No articles found.
                                </div>
                            ) : (
                                articles.map((article, index) => (
                                    <div
                                        key={article.id}
                                        className="w-full bg-white/0 flex justify-start items-stretch overflow-hidden border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                                    >
                                        <div className="w-16 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-black/90 text-sm font-normal font-['Poppins']">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center items-start min-w-0">
                                            <div className="w-full flex-1 p-3 flex flex-col justify-center items-start overflow-hidden min-w-0">
                                                <div
                                                    className="w-full justify-start text-black/90 text-sm font-normal font-['Poppins'] line-clamp-2"
                                                    title={article.title}
                                                >
                                                    {article.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-44 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <Badge
                                                    variant={getBadgeVariant(article.categoryColor)}
                                                    text={article.category}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-40 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                                    {formatDate(article.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-40 flex flex-col justify-center items-start shrink-0">
                                            <div className="w-full p-3 flex flex-col justify-center items-start overflow-hidden">
                                                <div className="w-full justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                                                    {formatDate(article.updatedAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-28 px-3 flex justify-start items-center gap-4 py-2 shrink-0">
                                            <button
                                                onClick={() => handleEditClick(article)}
                                                className="size-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg outline -outline-offset-1 outline-slate-300 hover:outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                title="Edit Article"
                                            >
                                                <Icon name="Pen" className="size-5 bg-current" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(article)}
                                                className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all cursor-pointer active:scale-95"
                                                title="Delete Article"
                                            >
                                                <Icon name="Delete 2" className="size-5 bg-current" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={totalArticles}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!articleToDelete}
                onClose={() => setArticleToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Article"
                message={articleToDelete ? `Are you sure you want to delete article "${articleToDelete.title}"? This action cannot be undone.` : ""}
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

export default ArticleManagementPage;

