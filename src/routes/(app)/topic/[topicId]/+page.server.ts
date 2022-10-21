import { supabaseServer } from "$lib/logic/server/supabase";
import type { TopicModel, TopicWithCreator } from "$lib/logic/shared-types";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { data, error: dbErr } = await supabaseServer
    .from<TopicWithCreator>("topics")
    .select("*, creator (username)")
    .eq("id", params.topicId)
    .single();

  if (dbErr) throw error(500, "Couldn't fetch topic");

  return {
    topic: data,
  };
};
