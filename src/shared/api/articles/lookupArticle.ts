import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";

interface ArticleRow {
  id: string;
  article_title: string;
  category: string;
  category_color: string;
  article_content: string;
  created_at: string;
  updated_at: string;
  imageUrl?: string | null;
}

export const mapArticleRow = (row: ArticleRow): Article => ({
  id: row.id,
  title: row.article_title,
  category: row.category,
  categoryColor: row.category_color,
  content: row.article_content,
  imageUrl: row.imageUrl || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export interface PaginatedArticlesResult {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getArticles = async (options?: {
  title?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  all?: boolean;
}): Promise<PaginatedArticlesResult> => {
  const isAll = options?.all === true;
  const page = options?.page ?? 1;
  const limit = isAll ? 10000 : (options?.limit ?? 10);
  const sort = options?.sort || "newest";

  let query = supabase.from("articles").select("*", { count: "exact" });

  if (options?.title?.trim()) {
    query = query.ilike("article_title", `%${options.title.trim()}%`);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "updated") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (!isAll) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error looking up articles:", error.message);
    throw new Error(error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: (data || []).map((row) => mapArticleRow(row)),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Error looking up article by id ${id}:`, error.message);
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapArticleRow(data);
};

export const getConsistingCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("articles")
    .select("category");

  if (error) {
    console.error("Error fetching unique categories:", error.message);
    throw new Error(error.message);
  }

  const categories = (data || []).map((row) => row.category).filter(Boolean);
  return Array.from(new Set(categories));
};
