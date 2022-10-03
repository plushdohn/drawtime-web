import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.session.user;

  if (!user) {
    throw redirect(307, `/login?next=${encodeURIComponent(url.pathname)}`);
  }
};
