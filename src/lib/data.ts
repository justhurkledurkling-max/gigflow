import { supabase } from "@/integrations/supabase/client";
import type { Opportunity, OutreachLog, Asset, Profile, PitchTemplate } from "@/lib/gigflow";
import { slugify } from "@/lib/gigflow";

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ---------------- Opportunities ---------------- */
export async function listOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createOpportunity(
  input: Partial<Opportunity> & { name: string },
): Promise<Opportunity> {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("opportunities")
    .insert({ ...input, user_id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateOpportunity(id: string, patch: Partial<Opportunity>): Promise<void> {
  const { error } = await supabase.from("opportunities").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- Outreach ---------------- */
export async function listOutreach(opportunityId: string): Promise<OutreachLog[]> {
  const { data, error } = await supabase
    .from("outreach_logs")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("contacted_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createOutreach(
  input: Omit<OutreachLog, "id" | "user_id" | "created_at">,
): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("outreach_logs").insert({ ...input, user_id });
  if (error) throw error;
  // keep opportunity last-contacted in sync
  await supabase
    .from("opportunities")
    .update({ last_contacted_at: input.contacted_at })
    .eq("id", input.opportunity_id);
}

export async function deleteOutreach(id: string): Promise<void> {
  const { error } = await supabase.from("outreach_logs").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- Assets ---------------- */
export async function listAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createAsset(input: Pick<Asset, "type" | "label" | "value">): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("assets").insert({ ...input, user_id });
  if (error) throw error;
}

export async function updateAsset(id: string, patch: Partial<Asset>): Promise<void> {
  const { error } = await supabase.from("assets").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- Profile (EPK) ---------------- */
export async function getOrCreateProfile(): Promise<Profile> {
  const user_id = await uid();
  const { data: existing, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) throw error;
  if (existing) return existing;

  const { data: created, error: insErr } = await supabase
    .from("profiles")
    .insert({ user_id, slug: slugify("artist") })
    .select("*")
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

/* ---------------- Bulk actions ---------------- */
export type OpportunityImport = Pick<
  Opportunity,
  "name" | "location" | "genre_fit" | "contact_info" | "link" | "notes" | "stage" | "follow_up_date"
>;

export async function importOpportunities(rows: OpportunityImport[]): Promise<number> {
  if (!rows.length) return 0;
  const user_id = await uid();
  const { data, error } = await supabase
    .from("opportunities")
    .insert(rows.map((r) => ({ ...r, user_id })))
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function setFollowUpDates(
  updates: { id: string; follow_up_date: string | null }[],
): Promise<void> {
  for (const u of updates) {
    const { error } = await supabase
      .from("opportunities")
      .update({ follow_up_date: u.follow_up_date })
      .eq("id", u.id);
    if (error) throw error;
  }
}

/* ---------------- Templates ---------------- */
export async function listTemplates(): Promise<PitchTemplate[]> {
  const { data, error } = await supabase
    .from("pitch_templates")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTemplate(
  input: Pick<PitchTemplate, "name" | "category" | "body">,
): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from("pitch_templates").insert({ ...input, user_id });
  if (error) throw error;
}

export async function bulkCreateTemplates(
  inputs: Pick<PitchTemplate, "name" | "category" | "body">[],
): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase
    .from("pitch_templates")
    .insert(inputs.map((i) => ({ ...i, user_id })));
  if (error) throw error;
}

export async function updateTemplate(id: string, patch: Partial<PitchTemplate>): Promise<void> {
  const { error } = await supabase.from("pitch_templates").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("pitch_templates").delete().eq("id", id);
  if (error) throw error;
}
