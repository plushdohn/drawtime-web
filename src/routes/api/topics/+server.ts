import { dev } from "$app/environment";
import { verifyCaptchaToken } from "$lib/logic/server/captcha";
import { createTopicWithWords } from "$lib/logic/server/database";
import { getTopicThumbnailsFromBase64 } from "$lib/logic/server/images";
import { uploadTopicThumbs } from "$lib/logic/server/storage";
import { createTopicSchema } from "$lib/logic/shared-types";
import { type RequestHandler, json, error } from "@sveltejs/kit";
import { z } from "zod";

export const POST: RequestHandler = async (event) => {
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

  // TODO: Check if user is subscriber or moderator
  // before validating topic

  const parseResult = createTopicSchema(dev).extend({ captchaToken: z.string() }).safeParse(body);

  if (!parseResult.success) throw error(400, "Invalid topic details");

  const data = parseResult.data;

  /**
   * Validate captcha
   */
  try {
    await verifyCaptchaToken(data.captchaToken);
  } catch (err) {
    throw error(403, "Invalid captcha:" + (err as Error).message);
  }

  /**
   * Try to process thumbnail before everything else,
   * so that if it's invalid we can quit before
   * commiting anything
   */
  let thumbs;
  try {
    thumbs = await getTopicThumbnailsFromBase64(data.thumbnail);
  } catch (err) {
    throw error(501, "Couldn't process thumbnail");
  }

  /**
   * Persist topic to database
   */
  let topicId;
  try {
    topicId = await createTopicWithWords({
      topic: {
        name: data.name,
        unlisted: data.unlisted,
        nsfw: data.nsfw,
      },
      words: data.words,
      creatorId: user.id,
    });
  } catch (err) {
    throw error(500, "Couldn't persist topic");
  }

  /**
   * Upload thumbnails
   */
  try {
    await uploadTopicThumbs(topicId, thumbs);
  } catch (err) {
    throw error(500, "Topic was created, but thumbnail couldn't be uploaded");
  }

  return json({ id: topicId });
};
