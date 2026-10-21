import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getPublicEpk = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "user_id, slug, artist_name, bio, genre, location, contact_email, contact_phone, website, hero_image_url, is_public",
      )
      .eq("slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();

    if (!profile)
      return { profile: null, assets: [] as { type: string; label: string; value: string }[] };

    const { data: assets } = await supabase
      .from("assets")
      .select("type, label, value, sort_order")
      .eq("user_id", profile.user_id)
      .order("sort_order", { ascending: true });

    return {
      profile,
      assets: (assets ?? []).map((a) => ({ type: a.type, label: a.label, value: a.value })),
    };
  });
