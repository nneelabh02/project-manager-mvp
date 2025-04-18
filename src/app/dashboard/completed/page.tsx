"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  created_at: string;
  project_id: string;
  status: string;
  projects: {
    title: string;
  }[];
}

interface CompletedTask {
  id: string;
  title: string;
  description: string;
  completed_at: string;
  project_id: string;
  project_title: string;
}

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        setIsLoading(true);
        
        // Validate Supabase client configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Supabase configuration is missing');
          return;
        }

        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase client:', supabase);

        console.log('Fetching user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        if (!user) {
          console.error('No user found');
          return;
        }

        console.log('Fetching tasks for user:', user.id);
        const response = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            created_at,
            project_id,
            status,
            projects!inner (
              title,
              user_id
            )
          `)
          .eq('projects.user_id', user.id)
          .eq('status', 'done')
          .order('created_at', { ascending: false });

        console.log('Raw Supabase response:', response);
        console.log('Response data:', response.data);
        console.log('Response error:', response.error);
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);

        // Validate response structure
        if (!response || typeof response !== 'object') {
          console.error('Invalid response structure:', response);
          return;
        }

        if (response.error) {
          const errorDetails = {
            message: response.error.message || 'Unknown error',
            details: response.error.details || 'No details available',
            hint: response.error.hint || 'No hint available',
            code: response.error.code || 'No error code'
          };
          console.error('Supabase error details:', errorDetails);
          throw new Error(`Supabase error: ${errorDetails.message}`);
        }

        const { data, error } = response;

        if (!data) {
          console.error('No data returned from Supabase');
          return;
        }

        console.log('Tasks fetched successfully:', data.length);
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed_at: task.created_at,
          project_id: task.project_id,
          project_title: task.projects[0]?.title || 'Unknown Project'
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching completed tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No completed tasks yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Completed on {new Date(task.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link
                      href={`/projects/${task.project_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 