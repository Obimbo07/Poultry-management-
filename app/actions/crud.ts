"use server"

import { createClient } from "@/lib/supabase/server"
import { getResource } from "@/lib/resources"
import { revalidatePath } from "next/cache"

const ALLOWED_TABLES = new Set(
  Object.values({
    suppliers: "suppliers",
    bird_batches: "bird_batches",
    feed_inventory: "feed_inventory",
    feed_consumption: "feed_consumption",
    egg_collection: "egg_collection",
    mortality: "mortality",
    vaccination: "vaccination",
    medication: "medication",
    customers: "customers",
    sales: "sales",
    expenses: "expenses",
    employees: "employees",
  }),
)

type ActionResult = { success: boolean; error?: string }

async function logAudit(action: string, table: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("audit_logs").insert({ user_id: user.id, action, table_name: table })
    }
  } catch {
    // non-blocking
  }
}

function coerce(values: Record<string, unknown>, slug: string) {
  const resource = getResource(slug)
  if (!resource) return values
  const out: Record<string, unknown> = {}
  for (const field of resource.fields) {
    const raw = values[field.name]
    if (raw === undefined) continue
    if (raw === "" || raw === null) {
      out[field.name] = null
      continue
    }
    if (field.type === "number") {
      const n = Number(raw)
      out[field.name] = Number.isNaN(n) ? null : n
    } else {
      out[field.name] = raw
    }
  }
  return out
}

export async function createRecord(slug: string, values: Record<string, unknown>): Promise<ActionResult> {
  const resource = getResource(slug)
  if (!resource || !ALLOWED_TABLES.has(resource.table)) {
    return { success: false, error: "Invalid resource" }
  }
  const supabase = await createClient()
  const payload = coerce(values, slug)
  const { error } = await supabase.from(resource.table).insert(payload)
  if (error) return { success: false, error: error.message }
  await logAudit(`Created ${resource.singular}`, resource.table)
  revalidatePath(`/${slug}`)
  return { success: true }
}

export async function updateRecord(
  slug: string,
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  const resource = getResource(slug)
  if (!resource || !ALLOWED_TABLES.has(resource.table)) {
    return { success: false, error: "Invalid resource" }
  }
  const supabase = await createClient()
  const payload = coerce(values, slug)
  const { error } = await supabase.from(resource.table).update(payload).eq("id", id)
  if (error) return { success: false, error: error.message }
  await logAudit(`Updated ${resource.singular}`, resource.table)
  revalidatePath(`/${slug}`)
  return { success: true }
}

export async function deleteRecords(slug: string, ids: string[]): Promise<ActionResult> {
  const resource = getResource(slug)
  if (!resource || !ALLOWED_TABLES.has(resource.table)) {
    return { success: false, error: "Invalid resource" }
  }
  const supabase = await createClient()
  const { error } = await supabase.from(resource.table).delete().in("id", ids)
  if (error) return { success: false, error: error.message }
  await logAudit(`Deleted ${ids.length} ${resource.label}`, resource.table)
  revalidatePath(`/${slug}`)
  return { success: true }
}
