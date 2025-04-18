"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import Link from "next/link";

interface Activity {
  id: string;
  type: 'task_update' | 'task_create' | 'task_delete' | 'project_update';
  task_id?: string;
  project_id: string;
  created_at: string;
  task_title?: string;
  project_title: string;
  old_status?: string;
  new_status?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  project_id: string;
  created_at: string;
  projects: {
    title: string;
  }[];
}

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
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
            status,
            project_id,
            created_at,
            projects!inner (
              title,
              user_id
            )
          `)
          .eq('projects.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        console.log('Raw Supabase response:', response);

        if (response.error) {
          console.error('Supabase error:', response.error);
          throw response.error;
        }

        const { data: tasks } = response;

        if (!tasks) {
          console.error('No data returned from Supabase');
          return;
        }

        console.log('Tasks fetched successfully:', tasks.length);
        // Transform tasks into activities
        const taskActivities: Activity[] = tasks.map((task) => ({
          id: task.id,
          type: 'task_create',
          task_id: task.id,
          project_id: task.project_id,
          created_at: task.created_at,
          task_title: task.title,
          project_title: task.projects[0]?.title || 'Unknown Project',
        }));

        setActivities(taskActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'task_create':
        return `Created task "${activity.task_title}" in project "${activity.project_title}"`;
      case 'task_update':
        return `Updated task "${activity.task_title}" from ${activity.old_status} to ${activity.new_status}`;
      case 'task_delete':
        return `Deleted task from project "${activity.project_title}"`;
      case 'project_update':
        return `Updated project "${activity.project_title}"`;
      default:
        return 'Unknown activity';
    }
  };

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
        <h1 className="text-3xl font-bold">Recent Activity</h1>
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
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent activity to show.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'task_create' && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                      {activity.type === 'task_update' && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/projects/${activity.project_id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Project
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 