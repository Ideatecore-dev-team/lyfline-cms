import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";
import { mapArticleRow } from "./lookupArticle";
import { processContentImages } from "./addArticle";
import { uploadImage, deleteImage } from "../media";

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
  const uploadedUrls: string[] = [];

  try {
    // 1. Process inline content images (Base64 -> Supabase Link)
    const processedContent = await processContentImages(id, articleData.content, uploadedUrls);

    // 2. Resolve existing banner from DB
    const { data: currentArticle, error: getError } = await supabase
      .from("articles")
      .select("imageUrl")
      .eq("id", id)
      .single();

    if (getError) {
      console.error("Error fetching article for edit:", getError.message);
      throw new Error(getError.message);
    }

    let finalBannerUrl: string | null = currentArticle?.imageUrl || null;

    // 3. Handle Banner Image Changes
    if (bannerFile) {
      const fileExt = bannerFile.name.split(".").pop() || "jpg";
      const fileName = `${id}_banner_${Date.now()}.${fileExt}`;

      // Delete old banner from storage first
      if (finalBannerUrl) {
        await deleteImage(finalBannerUrl);
      }

      finalBannerUrl = await uploadImage(bannerFile, BANNER_FOLDER, fileName);
      if (finalBannerUrl) {
        uploadedUrls.push(finalBannerUrl);
      }
    } else if (bannerRemoved) {
      if (finalBannerUrl) {
        await deleteImage(finalBannerUrl);
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

    return mapArticleRow(data);
  } catch (err) {
    // Clean up any files uploaded during this failed request
    if (uploadedUrls.length > 0) {
      for (const url of uploadedUrls) {
        await deleteImage(url);
      }
    }
    throw err;
  }
};
