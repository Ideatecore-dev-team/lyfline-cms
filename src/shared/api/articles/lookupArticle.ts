import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";

interface ArticleRow {
  id: string;
  article_title: string;
  article_title_indonesia?: string;
  category: string[] | string | null;
  category_color: string[] | string | null;
  article_content: string;
  article_content_indonesia?: string;
  created_at: string;
  updated_at: string;
  imageUrl?: string | null;
}

export const mapArticleRow = (row: ArticleRow): Article => {
  let categoriesArray: string[] = [];
  if (Array.isArray(row.category)) {
    categoriesArray = row.category;
  } else if (typeof row.category === "string" && row.category) {
    if (row.category.startsWith('[') && row.category.endsWith(']')) {
      try {
        categoriesArray = JSON.parse(row.category);
      } catch {
        categoriesArray = [row.category];
      }
    } else {
      categoriesArray = [row.category];
    }
  }

  let colorsArray: string[] = [];
  if (Array.isArray(row.category_color)) {
    colorsArray = row.category_color;
  } else if (typeof row.category_color === "string" && row.category_color) {
    if (row.category_color.startsWith('[') && row.category_color.endsWith(']')) {
      try {
        colorsArray = JSON.parse(row.category_color);
      } catch {
        colorsArray = [row.category_color];
      }
    } else {
      colorsArray = [row.category_color];
    }
  }

  return {
    id: row.id,
    title: row.article_title,
    titleIndonesia: row.article_title_indonesia || "",
    category: categoriesArray,
    categoryColor: colorsArray,
    content: row.article_content,
    contentIndonesia: row.article_content_indonesia || "",
    imageUrl: row.imageUrl || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

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
  const sort = options?.sort || "updated";

  let query = supabase.from("articles").select("*", { count: "exact" });

  if (options?.title?.trim()) {
    query = query.ilike("article_title", `%${options.title.trim()}%`);
  }
  if (options?.category) {
    query = query.contains("category", [options.category]);
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

  const categories = (data || [])
    .flatMap((row) => {
      if (Array.isArray(row.category)) return row.category;
      if (typeof row.category === "string" && row.category) {
        if (row.category.startsWith('[') && row.category.endsWith(']')) {
          try {
            return JSON.parse(row.category) as string[];
          } catch {
            return [row.category];
          }
        }
        return [row.category];
      }
      return [];
    })
    .filter(Boolean);
  return Array.from(new Set(categories));
};
