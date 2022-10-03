import { nanoid } from "nanoid";
import type { TopicModel, WordModel } from "$lib/logic/shared";
import { supabaseServer } from "./supabase";

export const createTopicWithWords = async (params: {
  topic: {
    name: string;
    nsfw: boolean;
    unlisted: boolean;
  };
  words: string[];
  creatorId: string;
}) => {
  const id = nanoid(12);

  const { error: topicErr } = await supabaseServer.from<TopicModel>("topics").insert({
    id,
    name: params.topic.name,
    nsfw: params.topic.nsfw,
    unlisted: params.topic.unlisted,
    creator: params.creatorId,
    general: false,
  });

  if (topicErr) throw topicErr;

  const { error: wordsErr } = await supabaseServer
    .from("words")
    .insert(params.words.map((w) => ({ topic: id, word: w.toLowerCase().trim() })));

  if (wordsErr) throw wordsErr;

  return id;
};

export async function getTopicWithWords(topicId: string) {
  const { error, data: topic } = await supabaseServer
    .from<TopicModel & { words: WordModel[] }>("topics")
    .select("*, words(word)")
    .match({ id: topicId })
    .single();

  if (error) throw error;

  return {
    ...topic,
    words: topic.words.map((w) => w.word),
  };
}

export async function getTopicsByUser(userId: string) {
  const { error, data: topics } = await supabaseServer
    .from<TopicModel>("topics")
    .select("*")
    .match({ creator: userId });

  if (error) throw error;

  return topics;
}

export async function updateTopicWithWords(
  topicId: string,
  changes: {
    name: string;
    nsfw: boolean;
    unlisted: boolean;
    words: string[];
  }
) {
  const { error: updateErr } = await supabaseServer
    .from<TopicModel>("topics")
    .update({
      name: changes.name,
      nsfw: changes.nsfw,
      unlisted: changes.unlisted,
    })
    .match({ id: topicId })
    .single();

  if (updateErr) throw updateErr;

  const { error: wordsDeleteErr } = await supabaseServer
    .from<WordModel>("words")
    .delete()
    .eq("topic", topicId);

  if (wordsDeleteErr) throw wordsDeleteErr;

  const { error: wordsInsertErr } = await supabaseServer.from<WordModel>("words").insert(
    changes.words.map((w) => ({
      topic: topicId,
      word: w.toLowerCase().trim(),
    }))
  );

  if (wordsInsertErr) throw wordsInsertErr;
}
