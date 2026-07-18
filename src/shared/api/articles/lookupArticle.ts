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

export const getArticles = async (filters?: {
  title?: string;
  category?: string;
}): Promise<Article[]> => {
  let query = supabase.from("articles").select("*");

  if (filters?.title?.trim()) {
    query = query.ilike("article_title", `%${filters.title.trim()}%`);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error looking up articles:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapArticleRow(row));
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
