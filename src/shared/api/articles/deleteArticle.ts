import { supabase } from "../../../supabaseClient";

const BUCKET_NAME = "Lyfline Files";
const BANNER_FOLDER = "Articles/Banner";

const getPathFromUrl = (url: string): string | null => {
  try {
    const decodeUrl = decodeURIComponent(url);
    const searchString = `/public/${BUCKET_NAME}/`;
    const index = decodeUrl.indexOf(searchString);
    if (index !== -1) {
      return decodeUrl.substring(index + searchString.length);
    }
  } catch (err) {
    console.error("Failed to parse URL for deletion:", err);
  }
  return null;
};

export const deleteArticle = async (id: string): Promise<void> => {
  // 1. Get article details to retrieve content and find storage banner
  const { data: article, error: getError } = await supabase
    .from("articles")
    .select("article_content")
    .eq("id", id)
    .maybeSingle();

  if (getError) {
    console.error("Error fetching article details for deletion:", getError.message);
    throw new Error(getError.message);
  }

  const pathsToDelete: string[] = [];

  // 2. Resolve content images to delete
  if (article && article.article_content) {
    const imgUrlRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const matches = [...article.article_content.matchAll(imgUrlRegex)];
    matches.forEach((match) => {
      const url = match[1];
      const path = getPathFromUrl(url);
      if (path) {
        pathsToDelete.push(path);
      }
    });
  }

  // 3. Resolve banner images to delete
  const { data: bannerFiles } = await supabase.storage
    .from(BUCKET_NAME)
    .list(BANNER_FOLDER, { search: id });

  if (bannerFiles && bannerFiles.length > 0) {
    const matchingBanners = bannerFiles
      .filter((f) => f.name.startsWith(`${id}_banner_`))
      .map((f) => `${BANNER_FOLDER}/${f.name}`);
    pathsToDelete.push(...matchingBanners);
  }

  // 4. Remove all files from Supabase Storage
  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete);

    if (storageError) {
      console.warn("Could not delete some storage files for article:", storageError.message);
    }
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
