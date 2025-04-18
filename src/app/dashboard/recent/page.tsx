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

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("You must be logged in to view activities");
          return;
        }

        // First check if the activities table exists
        const { data: tableExists, error: tableError } = await supabase
          .from('activities')
          .select('id')
          .limit(1);

        if (tableError) {
          if (tableError.code === '42P01') { // Table doesn't exist
            setError("Activities feature is not available yet");
            return;
          }
          throw tableError;
        }

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [supabase]);

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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