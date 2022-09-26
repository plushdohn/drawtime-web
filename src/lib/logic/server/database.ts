import { nanoid } from "nanoid";
import type { TopicModel } from "../shared";
import { supabaseServer } from "./supabase";

export const createTopicWithWords = async (
  topic: {
    name: string;
    nsfw: boolean;
    unlisted: boolean;
  },
  words: string[],
  creatorId: string
) => {
  const id = nanoid(12);

  const { error: topicErr } = await supabaseServer
    .from<TopicModel>("topics")
    .insert({
      id,
      name: topic.name,
      nsfw: topic.nsfw,
      unlisted: topic.unlisted,
      creator: creatorId,
      general: false,
    });

  if (topicErr) return { error: topicErr };

  const { error: wordsErr } = await supabaseServer
    .from("words")
    .insert(words.map((w) => ({ topic: id, word: w.toLowerCase().trim() })));

  if (wordsErr) return { error: wordsErr };

  return { id };
};
