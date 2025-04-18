"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

interface CompletedTask {
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

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("You must be logged in to view completed tasks");
          return;
        }

        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            projects (
              title
            )
          `)
          .eq('status', 'done')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01') { // Table doesn't exist
            setError("Tasks feature is not available yet");
            return;
          }
          throw error;
        }

        setTasks(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load completed tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedTasks();
  }, [supabase]);

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
                          Completed on {new Date(task.created_at).toLocaleDateString()}
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