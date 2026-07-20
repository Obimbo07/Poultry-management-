export type FieldType = "text" | "email" | "number" | "date" | "textarea" | "select"
export type ColumnType = "text" | "number" | "currency" | "date" | "badge"

export interface ResourceField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  step?: string
}

export interface ResourceColumn {
  key: string
  label: string
  type?: ColumnType
  hideOnMobile?: boolean
}

export interface ResourceConfig {
  table: string
  slug: string
  label: string
  singular: string
  description: string
  columns: ResourceColumn[]
  fields: ResourceField[]
  searchKeys: string[]
  defaultSort?: string
}

export const RESOURCES: Record<string, ResourceConfig> = {
  suppliers: {
    table: "suppliers",
    slug: "suppliers",
    label: "Suppliers",
    singular: "Supplier",
    description: "Feed, chick, and veterinary suppliers.",
    searchKeys: ["supplier_name", "email", "phone"],
    columns: [
      { key: "supplier_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email", hideOnMobile: true },
      { key: "address", label: "Address", hideOnMobile: true },
    ],
    fields: [
      { name: "supplier_name", label: "Supplier Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "textarea" },
    ],
  },
  "bird-batches": {
    table: "bird_batches",
    slug: "bird-batches",
    label: "Bird Batches",
    singular: "Batch",
    description: "Flocks/batches of birds on the farm.",
    searchKeys: ["batch_name", "breed", "category", "supplier"],
    columns: [
      { key: "batch_name", label: "Batch" },
      { key: "breed", label: "Breed" },
      { key: "category", label: "Category", type: "badge" },
      { key: "quantity", label: "Quantity", type: "number", hideOnMobile: true },
      { key: "age", label: "Age (wks)", type: "number", hideOnMobile: true },
      { key: "arrival_date", label: "Arrival", type: "date", hideOnMobile: true },
      { key: "purchase_price", label: "Cost", type: "currency", hideOnMobile: true },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "batch_name", label: "Batch Name", type: "text", required: true },
      { name: "breed", label: "Breed", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["Layer", "Broiler", "Breeder", "Chick"] },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "age", label: "Age (weeks)", type: "number" },
      { name: "arrival_date", label: "Arrival Date", type: "date" },
      { name: "supplier", label: "Supplier", type: "text" },
      { name: "purchase_price", label: "Purchase Price", type: "number", step: "0.01" },
      { name: "status", label: "Status", type: "select", options: ["active", "sold", "closed"] },
    ],
  },
  "feed-inventory": {
    table: "feed_inventory",
    slug: "feed-inventory",
    label: "Feed Inventory",
    singular: "Feed Item",
    description: "Feed stock, types, and reorder levels.",
    searchKeys: ["feed_name", "feed_type", "supplier"],
    columns: [
      { key: "feed_name", label: "Feed" },
      { key: "feed_type", label: "Type", type: "badge" },
      { key: "quantity", label: "Qty", type: "number" },
      { key: "unit", label: "Unit", hideOnMobile: true },
      { key: "reorder_level", label: "Reorder", type: "number", hideOnMobile: true },
      { key: "purchase_price", label: "Price", type: "currency", hideOnMobile: true },
      { key: "expiry_date", label: "Expiry", type: "date", hideOnMobile: true },
    ],
    fields: [
      { name: "feed_name", label: "Feed Name", type: "text", required: true },
      { name: "feed_type", label: "Feed Type", type: "select", options: ["Layer", "Broiler", "Grower", "Starter", "Finisher"] },
      { name: "supplier", label: "Supplier", type: "text" },
      { name: "quantity", label: "Quantity", type: "number", step: "0.01" },
      { name: "unit", label: "Unit", type: "select", options: ["kg", "bags", "tonnes", "lbs"] },
      { name: "purchase_price", label: "Purchase Price", type: "number", step: "0.01" },
      { name: "reorder_level", label: "Reorder Level", type: "number", step: "0.01" },
      { name: "expiry_date", label: "Expiry Date", type: "date" },
    ],
  },
  "feed-consumption": {
    table: "feed_consumption",
    slug: "feed-consumption",
    label: "Feed Consumption",
    singular: "Consumption Record",
    description: "Daily feed usage per batch.",
    searchKeys: ["notes"],
    defaultSort: "date",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "quantity_used", label: "Quantity Used", type: "number" },
      { key: "notes", label: "Notes", hideOnMobile: true },
    ],
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "quantity_used", label: "Quantity Used", type: "number", step: "0.01" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  "egg-production": {
    table: "egg_collection",
    slug: "egg-production",
    label: "Egg Production",
    singular: "Egg Record",
    description: "Daily egg collection and breakage.",
    searchKeys: [],
    defaultSort: "date",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "eggs_collected", label: "Collected", type: "number" },
      { key: "broken_eggs", label: "Broken", type: "number" },
    ],
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "eggs_collected", label: "Eggs Collected", type: "number" },
      { name: "broken_eggs", label: "Broken Eggs", type: "number" },
    ],
  },
  mortality: {
    table: "mortality",
    slug: "mortality",
    label: "Mortality",
    singular: "Mortality Record",
    description: "Bird deaths and causes.",
    searchKeys: ["reason"],
    defaultSort: "date",
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "dead_birds", label: "Dead Birds", type: "number" },
      { key: "reason", label: "Reason", type: "badge" },
    ],
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "dead_birds", label: "Dead Birds", type: "number" },
      { name: "reason", label: "Reason", type: "select", options: ["Disease", "Heat stress", "Injury", "Predator", "Unknown"] },
    ],
  },
  vaccination: {
    table: "vaccination",
    slug: "vaccination",
    label: "Vaccination",
    singular: "Vaccination",
    description: "Vaccine schedules and records.",
    searchKeys: ["vaccine_name", "administered_by"],
    defaultSort: "next_due_date",
    columns: [
      { key: "vaccine_name", label: "Vaccine" },
      { key: "next_due_date", label: "Next Due", type: "date" },
      { key: "administered_by", label: "By", hideOnMobile: true },
      { key: "notes", label: "Notes", hideOnMobile: true },
    ],
    fields: [
      { name: "vaccine_name", label: "Vaccine Name", type: "text", required: true },
      { name: "next_due_date", label: "Next Due Date", type: "date" },
      { name: "administered_by", label: "Administered By", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  medication: {
    table: "medication",
    slug: "medication",
    label: "Medication",
    singular: "Medication",
    description: "Medicine treatments per batch.",
    searchKeys: ["medicine", "dosage"],
    columns: [
      { key: "medicine", label: "Medicine" },
      { key: "dosage", label: "Dosage" },
      { key: "start_date", label: "Start", type: "date" },
      { key: "end_date", label: "End", type: "date" },
    ],
    fields: [
      { name: "medicine", label: "Medicine", type: "text", required: true },
      { name: "dosage", label: "Dosage", type: "text" },
      { name: "start_date", label: "Start Date", type: "date" },
      { name: "end_date", label: "End Date", type: "date" },
    ],
  },
  customers: {
    table: "customers",
    slug: "customers",
    label: "Customers",
    singular: "Customer",
    description: "Buyers of eggs, birds, and products.",
    searchKeys: ["full_name", "email", "phone"],
    columns: [
      { key: "full_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email", hideOnMobile: true },
      { key: "address", label: "Address", hideOnMobile: true },
    ],
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "textarea" },
    ],
  },
  sales: {
    table: "sales",
    slug: "sales",
    label: "Sales",
    singular: "Sale",
    description: "Product sales and revenue.",
    searchKeys: ["product", "sale_type", "payment_method", "sold_by"],
    defaultSort: "sale_date",
    columns: [
      { key: "sale_date", label: "Date", type: "date" },
      { key: "product", label: "Product" },
      { key: "sale_type", label: "Type", type: "badge" },
      { key: "quantity", label: "Qty", type: "number", hideOnMobile: true },
      { key: "price", label: "Unit Price", type: "currency", hideOnMobile: true },
      { key: "total", label: "Total", type: "currency" },
      { key: "payment_method", label: "Payment", type: "badge", hideOnMobile: true },
    ],
    fields: [
      { name: "sale_date", label: "Sale Date", type: "date", required: true },
      { name: "product", label: "Product", type: "text" },
      { name: "sale_type", label: "Sale Type", type: "select", options: ["Eggs", "Birds", "Manure", "Other"] },
      { name: "quantity", label: "Quantity", type: "number", step: "0.01" },
      { name: "price", label: "Unit Price", type: "number", step: "0.01" },
      { name: "total", label: "Total", type: "number", step: "0.01" },
      { name: "payment_method", label: "Payment Method", type: "select", options: ["Cash", "Bank Transfer", "Mobile Money", "Credit"] },
      { name: "sold_by", label: "Sold By", type: "text" },
    ],
  },
  expenses: {
    table: "expenses",
    slug: "expenses",
    label: "Expenses",
    singular: "Expense",
    description: "Operational costs and spending.",
    searchKeys: ["category", "description"],
    defaultSort: "expense_date",
    columns: [
      { key: "expense_date", label: "Date", type: "date" },
      { key: "category", label: "Category", type: "badge" },
      { key: "description", label: "Description", hideOnMobile: true },
      { key: "amount", label: "Amount", type: "currency" },
    ],
    fields: [
      { name: "expense_date", label: "Date", type: "date", required: true },
      { name: "category", label: "Category", type: "select", options: ["Feed", "Medication", "Labor", "Utilities", "Maintenance", "Transport", "Other"] },
      { name: "description", label: "Description", type: "textarea" },
      { name: "amount", label: "Amount", type: "number", step: "0.01" },
    ],
  },
  employees: {
    table: "employees",
    slug: "employees",
    label: "Employees",
    singular: "Employee",
    description: "Farm staff and payroll.",
    searchKeys: ["full_name", "role", "phone"],
    columns: [
      { key: "full_name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "phone", label: "Phone", hideOnMobile: true },
      { key: "salary", label: "Salary", type: "currency", hideOnMobile: true },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "salary", label: "Salary", type: "number", step: "0.01" },
      { name: "status", label: "Status", type: "select", options: ["active", "on_leave", "terminated"] },
    ],
  },
}

export function getResource(slug: string): ResourceConfig | undefined {
  return RESOURCES[slug]
}
