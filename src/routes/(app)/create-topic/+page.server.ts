import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.session.user) {
    throw redirect(307, "/login");
  }
};
