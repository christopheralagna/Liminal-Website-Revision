// Shared by runtime and schema tooling. Never accept these fields from clients.
export const authUserFields = {
  role: { type: ["ADMIN", "COORDINATOR", "VIEWER"] as ["ADMIN", "COORDINATOR", "VIEWER"], defaultValue: "VIEWER", input: false },
  isActive: { type: "boolean", defaultValue: true, input: false },
} as const;
