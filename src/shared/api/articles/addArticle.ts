import { supabase } from "../../../supabaseClient";
import { type Article } from "../article";
import { mapArticleRow } from "./lookupArticle";
import { uploadImage, getStoragePathFromUrl } from "../media";

const BUCKET_NAME = "Lyfline Files";
const BANNER_FOLDER = "Articles/Banner";
const CONTENT_IMAGES_FOLDER = "Articles/Content Images";

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper to convert Base64 string to a Blob object
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper to parse HTML and upload base64 images to Supabase Storage
export const processContentImages = async (
  articleId: string,
  contentHtml: string,
  uploadedPaths: string[]
): Promise<string> => {
  let updatedHtml = contentHtml;

  // Regex to match inline base64 images
  // Group 1: mime type (e.g. image/png), Group 2: base64 string
  const base64Regex = /<img[^>]+src="data:(image\/[^;]+);base64,([^"]+)"[^>]*>/g;
  const matches = [...contentHtml.matchAll(base64Regex)];
  let index = 0;

  for (const match of matches) {
    const fullTag = match[0];
    const mimeType = match[1];
    const base64Data = match[2];
    const ext = mimeType.split("/")[1] || "png";

    try {
      const blob = base64ToBlob(base64Data, mimeType);
      const fileName = `${articleId}_content_img_${index}_${Date.now()}.${ext}`;

      const publicUrl = await uploadImage(blob, CONTENT_IMAGES_FOLDER, fileName);
      const path = getStoragePathFromUrl(publicUrl, BUCKET_NAME);
      if (path) {
        uploadedPaths.push(path);
      }

      // Replace base64 src inside the tag with public url
      const updatedTag = fullTag.replace(/src="data:[^"]+"/, `src="${publicUrl}"`);
      updatedHtml = updatedHtml.replace(fullTag, updatedTag);

      index++;
    } catch (err) {
      console.error("Error processing inline image:", err);
      throw err;
    }
  }

  return updatedHtml;
};

export const addArticle = async (
  articleData: Omit<Article, "id" | "imageUrl" | "createdAt" | "updatedAt">,
  bannerFile?: File | null
): Promise<Article> => {
  const articleId = generateUUID();
  let bannerUrl: string | null = null;
  const uploadedPaths: string[] = [];

  try {
    // 1. Process inline content images (Base64 -> Supabase Link)
    const processedContent = await processContentImages(articleId, articleData.content, uploadedPaths);

    // 2. Upload Banner Image if provided
    if (bannerFile) {
      const fileExt = bannerFile.name.split(".").pop();
      const fileName = `${articleId}_banner_${Date.now()}.${fileExt}`;

      bannerUrl = await uploadImage(bannerFile, BANNER_FOLDER, fileName);
      const path = getStoragePathFromUrl(bannerUrl, BUCKET_NAME);
      if (path) {
        uploadedPaths.push(path);
      }
    }

    // 3. Insert Article Row into DB
    const { data, error } = await supabase
      .from("articles")
      .insert([
        {
          id: articleId,
          article_title: articleData.title,
          category: articleData.category,
          category_color: articleData.categoryColor || "#000000",
          article_content: processedContent,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting article row:", error.message);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Failed to create article.");
    }

    return mapArticleRow(data, bannerUrl);
  } catch (err) {
    // Cleanup files uploaded during this transaction on failure
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
    }
    throw err;
  }
};
