import { supabase } from "../../../supabaseClient";
import { deleteImage } from "../media";

export const deleteArticle = async (id: string): Promise<void> => {
  // 1. Get article details to retrieve content and find storage banner
  const { data: article, error: getError } = await supabase
    .from("articles")
    .select("imageUrl, article_content")
    .eq("id", id)
    .maybeSingle();

  if (getError) {
    console.error("Error fetching article details for deletion:", getError.message);
    throw new Error(getError.message);
  }

  const urlsToDelete: string[] = [];

  // 2. Resolve content images to delete
  if (article && article.article_content) {
    const imgUrlRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const matches = [...article.article_content.matchAll(imgUrlRegex)];
    matches.forEach((match) => {
      const url = match[1];
      if (url) {
        urlsToDelete.push(url);
      }
    });
  }

  // 3. Resolve banner image to delete
  if (article && article.imageUrl) {
    urlsToDelete.push(article.imageUrl);
  }

  // 4. Remove all files from VPS
  for (const url of urlsToDelete) {
    await deleteImage(url);
  }

  // 5. Delete Database Row
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting article row:", error.message);
    throw new Error(error.message);
  }
};
