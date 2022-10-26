import { verifyCaptchaToken } from "$lib/logic/server/captcha";
import { updateTopicWithWords } from "$lib/logic/server/database";
import { getTopicThumbnailsFromBase64 } from "$lib/logic/server/images";
import { deleteTopicThumbnails, uploadTopicThumbs } from "$lib/logic/server/storage";
import { createTopicSchema, type TopicModel } from "$lib/logic/shared-types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { z } from "zod";
import { supabaseServer } from "$lib/logic/server/supabase";

export const PATCH: RequestHandler = async (event) => {
  const user = event.locals.session.user;

  if (!user) {
    throw error(403, "Unauthenticated");
  }

  let body;
  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON payload");
  }

  const topicId = event.params.topicId;

  if (!topicId) {
    throw error(400, "Invalid topic ID");
  }

  // TODO: Check if user is subscriber or moderator
  // before validating topic

  const parseResult = createTopicSchema(dev)
    .extend({ thumbnail: z.string().nullable(), captchaToken: z.string() })
    .safeParse(body);

  if (!parseResult.success) throw error(400, "Invalid topic details");

  const data = parseResult.data;

  /**
   * Validate captcha
   */
  try {
    await verifyCaptchaToken(data.captchaToken);
  } catch {
    throw error(403, "Invalid captcha");
  }

  /**
   * Try to process thumbnail before everything else,
   * so that if it's invalid we can quit before
   * commiting anything
   */
  if (data.thumbnail) {
    let thumbs;
    try {
      thumbs = await getTopicThumbnailsFromBase64(data.thumbnail);
    } catch (err) {
      throw error(501, "Couldn't process thumbnail");
    }

    /**
     * Upload thumbnails
     */
    try {
      await uploadTopicThumbs(topicId, thumbs);
    } catch (err) {
      throw error(500, "Topic was created, but thumbnail couldn't be uploaded");
    }
  }

  /**
   * Persist topic to database
   */
  try {
    await updateTopicWithWords(topicId, {
      name: data.name,
      unlisted: data.unlisted,
      nsfw: data.nsfw,
      words: data.words,
    });
  } catch (err) {
    throw error(500, "Couldn't persist topic changes:" + (err as Error).message);
  }

  return json({ success: true });
};

export const DELETE: RequestHandler = async (event) => {
  const user = event.locals.session.user;

  if (!user) {
    throw error(403, "Unauthenticated");
  }

  const topicId = event.params.topicId;

  if (!topicId) {
    throw error(400, "Invalid topic ID");
  }

  // Make sure user owns the topic
  const { data: topic, error: fetchErr } = await supabaseServer
    .from<TopicModel>("topics")
    .select("id, creator")
    .eq("id", topicId)
    .single();

  if (fetchErr) throw error(404, "Topic not found");

  if (topic.creator !== user.id) throw error(403, "Topic not owned");

  // Delete topic, words are deleted on cascade
  const { error: deleteErr } = await supabaseServer
    .from<TopicModel>("topics")
    .delete()
    .eq("id", topicId)
    .single();

  if (deleteErr) throw error(500, "Couldn't delete topic");

  // Delete topic thumbnail
  try {
    await deleteTopicThumbnails(topicId);
  } catch {
    throw error(500, "Couldn't delete thumbnails");
  }

  return json({ success: true });
};
