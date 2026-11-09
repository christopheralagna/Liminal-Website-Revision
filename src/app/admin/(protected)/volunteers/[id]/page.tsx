import { VolunteerEditor } from "@/components/admin/VolunteerEditor";

export default async function VolunteerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  return <VolunteerEditor id={id} saved={saved === "1"} />;
}
