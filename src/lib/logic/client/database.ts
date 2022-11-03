import type { WordModel, TopicModel, TopicWithCreator } from "../shared-types";
import { supabaseClient } from "./supabase";

export const deleteTopicWithWords = async (topicId: string) => {
  const { error: wordsErr } = await supabaseClient.from("words").delete().eq("topic", topicId);

  if (wordsErr) throw wordsErr;

  const { error: topicErr } = await supabaseClient
    .from<TopicModel>("topics")
    .delete()
    .eq("id", topicId)
    .single();

  if (topicErr) throw topicErr;
};

export const getTopicWithWords = async (topicId: string) => {
  const { error: topicErr, data: topic } = await supabaseClient
    .from<TopicModel>("topics")
    .select("*")
    .eq("id", topicId)
    .single();

  if (topicErr) throw topicErr;

  const { error: wordsErr, data: words } = await supabaseClient
    .from<WordModel>("words")
    .select("word")
    .eq("topic", topicId);

  if (wordsErr) throw wordsErr;

  return {
    ...topic,
    words: words.map((w) => w.word),
  };
};

export async function searchTopics(query: string) {
  const words = query.split(" ");

  const search = words.map((w) => `'${w}'`).join(` | `);

  console.log(search);

  const { data, error } = await supabaseClient
    .from<TopicWithCreator>("topics")
    .select("id, name, creator (username)")
    .textSearch("name", search)
    .limit(5);

  if (error) throw error;

  return data;
}
