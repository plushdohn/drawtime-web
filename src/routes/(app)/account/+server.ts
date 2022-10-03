import { getProfilePictureFromBase64 } from "$lib/logic/server/images";
import { uploadProfilePicture } from "$lib/logic/server/storage";
import { supabaseServer } from "$lib/logic/server/supabase";
import type { ProfileModel } from "$lib/logic/shared";
import { type RequestHandler, json, error } from "@sveltejs/kit";
import { z } from "zod";

export const PATCH: RequestHandler = async (event) => {
  const user = event.locals.session.user;

  if (!user) {
    throw error(403, "Unauthenticated");
  }

  let body;
  try {
    body = await event.request.json();
  } catch {
    throw error(400, "Invalid JSON payload");
  }

  const parseResult = z
    .object({
      username: z.string().min(4).max(32),
      profilePicture: z.string().nullable(),
    })
    .safeParse(body);

  if (!parseResult.success) throw error(400, "Invalid changes");

  const changes = parseResult.data;

  let newAvatarUrl: string | null = null;

  if (changes.profilePicture !== null) {
    try {
      const image = await getProfilePictureFromBase64(changes.profilePicture);

      newAvatarUrl = await uploadProfilePicture(user.id, image);
    } catch (err) {
      throw error(500, "Couldn't process profile picture");
    }
  }

  const { error: updateErr } = await supabaseServer
    .from<ProfileModel>("profiles")
    .update({
      username: changes.username,
      ...(newAvatarUrl === null ? {} : { avatarUrl: newAvatarUrl }),
    })
    .match({ id: user.id })
    .single();

  if (updateErr) throw error(500, "Couldn't apply changes");

  return json({ success: true });
};
