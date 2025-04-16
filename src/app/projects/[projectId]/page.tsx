// src/app/projects/[projectId]/page.tsx
import ProjectDetailsContent from './ProjectDetailsContent';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ProjectDetailsContent projectId={params.projectId} />;
}
