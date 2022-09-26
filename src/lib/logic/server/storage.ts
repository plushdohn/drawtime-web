import { supabaseServer } from "./supabase";

export const uploadTopicThumbs = async (
  topicId: string,
  thumbs: {
    jpeg: Buffer;
    webp: Buffer;
  }
) => {
  const bucket = supabaseServer.storage.from("public");

  await Promise.all([
    bucket.upload(`images/topics/${topicId}/thumb.jpg`, thumbs.jpeg, {
      contentType: "image/jpeg",
    }),
    bucket.upload(`images/topics/${topicId}/thumb.webp`, thumbs.webp, {
      contentType: "image/webp",
    }),
  ]);
};
