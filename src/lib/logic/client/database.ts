import type { WordModel, TopicModel } from "../shared";
import { supabaseClient } from "./supabase";

export const deleteTopicWithWords = async (topicId: string) => {
  const { error: wordsErr } = await supabaseClient
    .from("words")
    .delete()
    .eq("topic", topicId);

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
