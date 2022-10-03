import { getTopicsByUser } from "$lib/logic/server/database";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.session.user;

  if (!user) {
    throw redirect(307, "/login");
  }

  try {
    const topics = await getTopicsByUser(user.id);

    return {
      topics,
    };
  } catch (err) {
    throw error(500, "Couldn't fetch user topics");
  }
};
