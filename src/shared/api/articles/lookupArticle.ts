import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";

const BUCKET_NAME = "Lyfline Files";
const BANNER_FOLDER = "Articles/Banner";

interface ArticleRow {
  id: string;
  article_title: string;
  category: string;
  category_color: string;
  article_content: string;
  created_at: string;
  updated_at: string;
}

export const mapArticleRow = (row: ArticleRow, imageUrl: string | null): Article => ({
  id: row.id,
  title: row.article_title,
  category: row.category,
  categoryColor: row.category_color,
  content: row.article_content,
  imageUrl: imageUrl || null,
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

  // Fetch all banner files in storage to resolve URLs
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(BANNER_FOLDER);

  const imageMap: Record<string, string> = {};
  if (files) {
    files.forEach((file) => {
      const index = file.name.indexOf("_banner_");
      if (index !== -1) {
        const articleId = file.name.substring(0, index);
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${BANNER_FOLDER}/${file.name}`);
        imageMap[articleId] = urlData.publicUrl;
      }
    });
  }

  return (data || []).map((row) => mapArticleRow(row, imageMap[row.id] || null));
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

  // Resolve banner image for this single article
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(BANNER_FOLDER, { search: id });

  let imageUrl: string | null = null;
  if (files && files.length > 0) {
    const matchingFile = files.find((f) => f.name.startsWith(`${id}_banner_`));
    if (matchingFile) {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${BANNER_FOLDER}/${matchingFile.name}`);
      imageUrl = urlData.publicUrl;
    }
  }

  return mapArticleRow(data, imageUrl);
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
