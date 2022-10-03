import { supabaseServer } from "$lib/logic/server/supabase";
import { error } from "@sveltejs/kit";
import type { ProfileModel } from "$lib/logic/shared";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (locals.session.user) {
    const { error: profileErr, data: profile } = await supabaseServer
      .from<ProfileModel>("profiles")
      .select("*")
      .match({ id: locals.session.user.id })
      .single();

    if (profileErr) {
      throw error(500, "Couldn't fetch user details:" + profileErr.message);
    }

    return {
      profile,
    };
  }

  return {
    profile: null,
  };
};
