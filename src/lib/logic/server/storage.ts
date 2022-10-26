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

export async function uploadProfilePicture(userId: string, picture: Buffer) {
  const bucket = supabaseServer.storage.from("public");

  const path = `images/avatars/${userId}/128.jpg`;

  const { error } = await bucket.upload(path, picture, {
    contentType: "image/jpeg",
  });

  if (error) throw error;

  return bucket.getPublicUrl(path).publicURL as string;
}

export async function deleteTopicThumbnails(topicId: string) {
  const bucket = supabaseServer.storage.from("public");

  const folder = `images/topics/${topicId}`;

  const { data: list, error } = await bucket.list(folder);

  if (error) throw error;

  const toRemove = list!.map((t) => `${folder}/${t.name}`);

  const { error: deletionError } = await bucket.remove(toRemove);

  if (deletionError) throw deletionError;
}
