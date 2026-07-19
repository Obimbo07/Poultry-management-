import { createClient } from "@/lib/supabase/server"
import { RESOURCES } from "@/lib/resources"
import { ResourcePage } from "@/components/resource-page"

export default async function Page() {
  const resource = RESOURCES["medication"]
  const supabase = await createClient()

  const { data } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.defaultSort ?? "created_at", { ascending: false })

  const { data: settings } = await supabase
    .from("settings")
    .select("currency")
    .limit(1)
    .maybeSingle()

  return (
    <ResourcePage
      resource={resource}
      rows={(data ?? []) as Record<string, unknown>[]}
      currency={settings?.currency ?? "USD"}
    />
  )
}
