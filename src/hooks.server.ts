import "$lib/logic/client/supabase";
import { auth } from "@supabase/auth-helpers-sveltekit/server";

export const handle = auth();
