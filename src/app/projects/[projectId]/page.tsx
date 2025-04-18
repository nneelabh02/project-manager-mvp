// src/app/projects/[projectId]/page.tsx
import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/utils/supabaseServer';
import ProjectDetailsContent from './ProjectDetailsContent';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createServerSupabaseClient();
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return notFound();
    }

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project error:', projectError);
      return notFound();
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectDetailsContent projectId={projectId} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in project page:', error);
    return notFound();
  }
}
