import { supabaseServer } from "$lib/logic/server/supabase";
import type { TopicWithCreator } from "$lib/logic/shared";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ setHeaders }) => {
  const [
    { data: generalTopics, error: generalErr },
    { data: trendingTopics, error: trendingErr },
    { data: newTopics, error: newErr },
  ] = await Promise.all([
    supabaseServer
      .from<TopicWithCreator>("topics")
      .select("*, creator (username)")
      .eq("general", true),
    supabaseServer
      .from<TopicWithCreator>("topics")
      .select("*, creator (username)")
      .eq("general", false)
      .eq("unlisted", false)
      .order("plays")
      .limit(10),
    supabaseServer
      .from<TopicWithCreator>("topics")
      .select("*, creator (username)")
      .eq("general", false)
      .eq("unlisted", false)
      .order("createdAt")
      .limit(10),
  ]);

  if (generalErr) throw error(500, "Couldn't load feed");

  if (trendingErr) throw error(500, "Couldn't load feed");

  if (newErr) throw error(500, "Couldn't load feed");

  return {
    generalTopics: generalTopics!,
    trendingTopics: trendingTopics!,
    newTopics: newTopics!,
  };
};
