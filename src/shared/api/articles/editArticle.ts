import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";
import { mapArticleRow } from "./lookupArticle";
import { processContentImages } from "./addArticle";
import { uploadImage, getStoragePathFromUrl } from "../media";

const BUCKET_NAME = "Lyfline Files";
const BANNER_FOLDER = "Articles/Banner";

export const editArticle = async (
  id: string,
  articleData: {
    title: string;
    category: string;
    categoryColor: string;
    content: string;
  },
  bannerFile?: File | null,
  bannerRemoved?: boolean
): Promise<Article> => {
  const uploadedPaths: string[] = [];

  try {
    // 1. Process inline content images (Base64 -> Supabase Link)
    const processedContent = await processContentImages(id, articleData.content, uploadedPaths);

    // 2. Resolve existing banner
    const { data: files } = await supabase.storage
      .from(BUCKET_NAME)
      .list(BANNER_FOLDER, { search: id });

    const oldBanners = files ? files.filter((f) => f.name.startsWith(`${id}_banner_`)) : [];
    const pathsToDelete = oldBanners.map((f) => `${BANNER_FOLDER}/${f.name}`);

    let finalBannerUrl: string | null = null;
    if (oldBanners.length > 0) {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${BANNER_FOLDER}/${oldBanners[0].name}`);
      finalBannerUrl = urlData.publicUrl;
    }

    // 3. Handle Banner Image Changes
    if (bannerFile) {
      const fileExt = bannerFile.name.split(".").pop();
      const fileName = `${id}_banner_${Date.now()}.${fileExt}`;

      // Delete old banners from storage first
      if (pathsToDelete.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
      }

      finalBannerUrl = await uploadImage(bannerFile, BANNER_FOLDER, fileName);
      const path = getStoragePathFromUrl(finalBannerUrl, BUCKET_NAME);
      if (path) {
        uploadedPaths.push(path);
      }
    } else if (bannerRemoved) {
      if (pathsToDelete.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
      }
      finalBannerUrl = null;
    }

    // 4. Update Database Row
    const { data, error: updateError } = await supabase
      .from("articles")
      .update({
        article_title: articleData.title,
        category: articleData.category,
        category_color: articleData.categoryColor,
        article_content: processedContent,
        updated_at: new Date().toISOString(),
        imageUrl: finalBannerUrl,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating article row:", updateError.message);
      throw new Error(updateError.message);
    }

    return mapArticleRow(data, finalBannerUrl);
  } catch (err) {
    // Clean up any files uploaded during this failed request
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
    }
    throw err;
  }
};
