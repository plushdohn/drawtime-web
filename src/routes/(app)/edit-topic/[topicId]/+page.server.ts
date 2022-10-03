import { getTopicWithWords } from "$lib/logic/server/database";
import { error, json, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.session.user) {
    throw redirect(307, "/login");
  }

  try {
    const topic = await getTopicWithWords(params.topicId);
    return { topic };
  } catch (err) {
    throw error(404, "Topic not found");
  }
};
