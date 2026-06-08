export interface Article {
  id: string;
  title: string;          // maps to article_title
  category: string;       // maps to category
  categoryColor: string;  // maps to category_color
  content: string;        // maps to article_content
  imageUrl?: string | null; // Banner image URL resolved from storage
  createdAt: string;      // maps to created_at
  updatedAt: string;      // maps to updated_at
}

export {
  getArticles,
  getArticleById,
  getConsistingCategories,
} from "./articles/lookupArticle";

export { addArticle } from "./articles/addArticle";
export { editArticle } from "./articles/editArticle";
export { deleteArticle } from "./articles/deleteArticle";
