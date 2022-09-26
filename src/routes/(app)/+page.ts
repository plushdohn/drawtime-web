import { supabaseClient } from "$lib/logic/client/supabase";
import type { TopicModel } from "$lib/logic/shared";
import { error, type Load } from "@sveltejs/kit";

export const load: Load = async () => {
  const [
    { data: generalTopics, error: generalErr },
    { data: trendingTopics, error: trendingErr },
    { data: newTopics, error: newErr },
  ] = await Promise.all([
    supabaseClient.from<TopicModel>("topics").select("*").eq("general", true),
    supabaseClient
      .from<TopicModel>("topics")
      .select("*")
      .eq("general", false)
      .eq("unlisted", false)
      .order("plays")
      .limit(10),
    supabaseClient
      .from<TopicModel>("topics")
      .select("*")
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
