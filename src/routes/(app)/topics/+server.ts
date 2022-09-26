import { createTopicWithWords } from "$lib/logic/server/database";
import { uploadTopicThumbs } from "$lib/logic/server/storage";
import { supabaseServer } from "$lib/logic/server/supabase";
import { getScaledThumbnail } from "$lib/logic/server/thumbnail";
import { topicSchema } from "$lib/logic/shared";
import { type RequestHandler, json, error } from "@sveltejs/kit";
import { z } from "zod";

/*
export const PATCH: RequestHandler = async (event) => {
  
};
*/

export const POST: RequestHandler = async (event) => {
  let body;
  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON payload");
  }

  const parseResult = z
    .object({
      topic: topicSchema,
      authToken: z.string(),
      captchaToken: z.string(),
    })
    .safeParse(body);

  if (!parseResult.success) {
    throw error(
      400,
      "Request contained invalid data:" + parseResult.error.message
    );
  }

  const { data } = parseResult;

  const { error: authErr, user } = await supabaseServer.auth.api.getUser(
    data.authToken
  );

  if (authErr || !user) {
    throw error(401, "Unauthorized");
  }

  const { error: thumbErr, thumbs } = await getScaledThumbnail(
    data.topic.thumbnail
  );

  if (thumbErr) {
    console.log(thumbErr.message);
    throw error(
      500,
      "Couldn't process thumbnail, it's either invalid or not supported"
    );
  }

  const { error: topicErr, id } = await createTopicWithWords(
    {
      name: data.topic.name,
      unlisted: data.topic.unlisted,
      nsfw: data.topic.nsfw,
    },
    data.topic.words,
    user.id
  );

  if (topicErr) throw error(500, "Couldn't create topic");

  await uploadTopicThumbs(id, thumbs);

  return json({
    id,
  });
};
