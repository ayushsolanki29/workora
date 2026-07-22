const MIGRATION_TEMPLATE = {
  clients: [
    {
      id: "client-1",
      name: "Acme Corp",
      email: "billing@acmecorp.com",
      phone: "+1-555-0100",
      status: "Active"
    },
    {
      id: "client-2",
      name: "Stark Industries",
      email: "tony@stark.com",
      phone: "+1-555-0200",
      status: "Active"
    },
    {
      id: "client-3",
      name: "Wayne Enterprises",
      email: "finance@wayne.com",
      phone: "+1-555-0300",
      status: "Active"
    },
    {
      id: "client-4",
      name: "Cyberdyne Systems",
      email: "accounts@cyberdyne.com",
      phone: "+1-555-0400",
      status: "Inactive"
    },
    {
      id: "client-5",
      name: "Umbrella Corp",
      email: "billing@umbrella.com",
      phone: "+1-555-0500",
      status: "Lead"
    }
  ],
  projects: [
    {
      id: "project-1",
      clientId: "client-1",
      title: "Website Redesign",
      description: "Complete overhaul of the Acme Corp corporate website",
      startDate: "2026-01-15T00:00:00Z",
      estimatedEndDate: "2026-03-30T00:00:00Z",
      status: "Active"
    },
    {
      id: "project-2",
      clientId: "client-2",
      title: "AI Automation",
      description: "Implementing AI driven workflows",
      startDate: "2026-02-01T00:00:00Z",
      estimatedEndDate: "2026-05-15T00:00:00Z",
      status: "Active"
    },
    {
      id: "project-3",
      clientId: "client-3",
      title: "Security Audit",
      description: "Comprehensive security audit of Wayne networks",
      startDate: "2026-03-10T00:00:00Z",
      estimatedEndDate: "2026-04-20T00:00:00Z",
      status: "Completed"
    },
    {
      id: "project-4",
      clientId: "client-4",
      title: "Legacy Migration",
      description: "Migrating legacy systems to cloud",
      startDate: "2025-10-01T00:00:00Z",
      estimatedEndDate: "2025-12-31T00:00:00Z",
      status: "Completed"
    },
    {
      id: "project-5",
      clientId: "client-5",
      title: "Market Research",
      description: "Q3 Market analysis and competitor research",
      startDate: "2026-05-01T00:00:00Z",
      estimatedEndDate: "2026-07-31T00:00:00Z",
      status: "Active"
    }
  ],
  invoices: Array.from({ length: 12 }).map((_, i) => ({
    id: `invoice-${i + 1}`,
    clientId: `client-${(i % 5) + 1}`,
    projectId: `project-${(i % 5) + 1}`,
    invoiceNumber: `INV-2026-${String(i + 1).padStart(3, '0')}`,
    status: "Paid",
    issueDate: `2026-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`,
    dueDate: `2026-${String(i + 1).padStart(2, '0')}-15T00:00:00Z`,
    currency: "USD",
    items: [
      {
        description: "Monthly Service Retainer",
        quantity: 1,
        unitPrice: 2000 + (Math.sin(i / 2) * 1500) + (i * 500), // Creates a nice curve
        taxRate: 10
      }
    ]
  })),
  payments: Array.from({ length: 12 }).map((_, i) => ({
    id: `payment-${i + 1}`,
    invoiceId: `invoice-${i + 1}`,
    amount: (2000 + (Math.sin(i / 2) * 1500) + (i * 500)) * 1.1, // matches invoice total with tax
    date: `2026-${String(i + 1).padStart(2, '0')}-10T00:00:00Z`,
    method: "Bank Transfer",
    reference: `TXN-${2026000 + i}`
  })),
  expenses: Array.from({ length: 12 }).map((_, i) => ({
    id: `expense-${i + 1}`,
    clientId: `client-${(i % 5) + 1}`,
    projectId: `project-${(i % 5) + 1}`,
    description: "Infrastructure & Software Services",
    amount: 1000 + (Math.sin(i / 2) * 400) + (i * 150),
    date: `2026-${String(i + 1).padStart(2, '0')}-15T00:00:00Z`,
    category: "Software",
    status: "Paid",
    currency: "USD"
  }))
};

const AI_PROMPT = `You are an expert data migration assistant and structural parser. Your task is to extract unstructured or semi-structured data from the provided context (which may include PDFs, Excel spreadsheets, CSVs, or messy text) and cleanly transform it into a strict JSON payload matching the target schema.

RULES & INSTRUCTIONS:
1. DATA EXTRACTION: Extract all real clients, projects, invoices, payments, and expenses from the provided user data. Do NOT use the fake placeholder names (like Acme Corp) from the template. The template is strictly for structural reference.
2. MISSING DATA: If a required text field cannot be found, populate it with exactly "this-is-blank". Do not use null, undefined, or empty strings. For missing numbers, use 0.
3. ID MAPPING (UUIDs): You MUST generate and use valid UUIDs (e.g. "f3833cc9-7347-418f-9901-e10690f33e0d") for all "id" fields. Furthermore, you MUST use these same UUIDs to link relational records logically (e.g., if a client's id is UUID-A, then their invoices must have clientId = UUID-A).
4. DATE FORMATTING: All dates must be strictly ISO-8601 (e.g., "YYYY-MM-DDTHH:mm:ssZ"). If the source data has messy dates like "Jan 5th 24", intelligently parse it into ISO.
5. STATUS VALUES: Normalize statuses based on the template (e.g. Clients: "Active", "Inactive", "Lead". Invoices: "Draft", "Paid", "Overdue").
6. STRICT OUTPUT: Return ONLY valid JSON. Absolutely no markdown fences (e.g., json blocks), no introductory text, no conversational filler, and no preamble.

TARGET SCHEMA SHAPE (Use this ONLY as a structural reference, DO NOT copy its exact values):
${JSON.stringify(MIGRATION_TEMPLATE, null, 2)}

Please begin parsing the following data exactly as instructed:
[INSERT YOUR DATA HERE]`;

module.exports = {
  MIGRATION_TEMPLATE,
  AI_PROMPT
};
