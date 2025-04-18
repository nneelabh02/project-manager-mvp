'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import router for navigation
import { useParams } from 'next/navigation'; // For getting projectId
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  project_id: string;
  created_at: string;
  due_date?: string;
}

export default function ProjectBoard() {
  const router = useRouter();
  const { projectId } = useParams(); // Get projectId from URL params
  const supabase = createClientComponentClient<Database>();

  // State to store tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on page load
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
      setLoading(false);
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId, supabase]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Project Board</h1>

      {/* Add New Task Button */}
      <button
        onClick={() => router.push(`/dashboard/${projectId}/create-task`)}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg mb-6"
      >
        Add New Task
      </button>

      {/* Loading State */}
      {loading && <div>Loading tasks...</div>}

      {/* Render list of tasks */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg">
              <h3 className="text-lg font-bold">
                {/* Link to Task Details */}
                <a href={`/dashboard/${projectId}/${task.id}`} className="text-blue-600 hover:underline">
                  {task.title}
                </a>
              </h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
