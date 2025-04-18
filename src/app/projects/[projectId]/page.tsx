// src/app/projects/[projectId]/page.tsx
import { createServerSupabaseClient } from "@/utils/supabaseServer";
import ProjectDetailsContent from "./ProjectDetailsContent";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const supabase = createServerSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return <div>You must be logged in to view this project</div>;
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .single();

  if (!project) {
    return <div>Project not found</div>;
  }

  return <ProjectDetailsContent projectId={params.projectId} />;
}
