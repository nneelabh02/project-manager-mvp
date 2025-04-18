"use client";

// src/app/dashboard/[projectId]/[taskId]/page.tsx

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const TaskPage = ({ params }: { params: { projectId: string; taskId: string } }) => {
  const router = useRouter();
  const { projectId, taskId } = params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (taskId && projectId) {
      const fetchTask = async () => {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .eq("project_id", projectId)
          .single();

        if (error) {
          console.error("Error fetching task:", error);
          return;
        }

        setTask(data);
        setLoading(false);
      };

      fetchTask();
    }
  }, [taskId, projectId, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">{task.title}</h1>
      <p className="mt-4">{task.description}</p>
      <div className="mt-6">
        <p>Status: {task.status}</p>
        <p>Due Date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}</p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => router.push(`/projects/${projectId}`)} // Updated path to match your app structure
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Back to Project Board
        </button>
      </div>
    </div>
  );
};

export default TaskPage;
