import { derived, get as getStoreValue, readable, type Readable } from "svelte/store";
import type { ProfileModel } from "../shared";
import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

type AuthStore = {
  user: User;
  accessToken: string;
} | null;

const initialSession = supabaseClient.auth.session();

export const authStore = readable<AuthStore>(
  initialSession ? { user: initialSession.user!, accessToken: initialSession.access_token } : null,
  (set) => {
    const { data: sub } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        set({
          user: session.user!,
          accessToken: session.access_token,
        });
      } else {
        set(null);
      }
    });

    return () => {
      if (sub) sub.unsubscribe();
    };
  }
);

type UserProfileStore = {
  pending: boolean;
  profile: ProfileModel | null;
  error: string | null;
};

export const userProfileStore = derived<Readable<AuthStore>, UserProfileStore>(
  authStore,
  ($authStore, set) => {
    if ($authStore !== null && getStoreValue(userProfileStore).profile === null) {
      supabaseClient
        .from<ProfileModel>("profiles")
        .select("*")
        .eq("id", $authStore.user.id)
        .single()
        .then(({ data: profile, error }) => {
          if (error) {
            set({ error: error.message, pending: false, profile: null });
            console.warn("Profile loading error:" + error.message);
          } else set({ profile, pending: false, error: null });
        });
    } else if ($authStore === null) {
      set({ profile: null, pending: false, error: null });
    }
  },
  {
    pending: true,
    profile: null,
    error: null,
  }
);

export const signInWithGoogle = async (redirect?: string) => {
  const { user, error } = await supabaseClient.auth.signIn(
    {
      provider: "google",
    },
    {
      redirectTo: `${window.location.origin}/login-success${redirect ? `?next=${redirect}` : ""}`,
    }
  );

  if (error) throw error;

  return user;
};

export const signOut = async () => {
  await supabaseClient.auth.signOut();
};
