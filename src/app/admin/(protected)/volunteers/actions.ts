"use server";
import { revalidatePath } from "next/cache";
import { saveVolunteer } from "@/server/volunteers/service";

export async function saveVolunteerAction(mode: "create" | "update", input: unknown) {
  const result = await saveVolunteer(mode, input);
  if (result.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/volunteers/${result.id}`);
  }
  return result;
}
