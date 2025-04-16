"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import TaskForm from "./TaskForm";
import TaskCard from "./TaskCard";

interface Task {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done";
}

interface Props {
    projectId: string;
}

const ProjectDetailsPageClient = ({ projectId }: Props) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterStatus, setFilterStatus] = useState<"all" | "todo" | "in_progress" | "done">("all");

    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("project_id", projectId);

            if (error) {
                console.error("Error fetching tasks:", error.message);
            } else {
                setTasks(data || []);
            }
        };

        fetchTasks();
    }, [projectId]);

    const handleAddTask = async (title: string, description: string, status: "todo" | "in_progress" | "done") => {
        const { data, error } = await supabase
          .from("tasks")
          .insert([{ title, description, status, project_id: projectId }])
          .single();
      
        if (error) {
          console.error("Error adding task:", error.message);
        } else {
          // After successful task insertion, update the state with the new task
          console.log("New task added:", data);
          setTasks((prevTasks) => [...prevTasks, data]); // Ensure new task is added to the list
        }
      };

    const handleDeleteTask = async (taskId: string) => {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (!error) {
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } else {
            console.error("Error deleting task:", error.message);
        }
    };

    const handleEditTask = async (updatedTask: Task) => {
        const { data, error } = await supabase
            .from("tasks")
            .update({
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
            })
            .eq("id", updatedTask.id)
            .select()
            .single();

        if (error) {
            console.error("Error editing task:", error.message);
            return;
        }

        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === updatedTask.id ? data : task))
        );
    };


    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Project Tasks</h1>

            <TaskForm onAddTask={handleAddTask} />

            <div className="flex gap-4 my-6">
                {["all", "todo", "in_progress", "done"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as typeof filterStatus)}
                        className={`px-4 py-2 rounded-lg ${filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        {status === "all" ? "All" : status.replace("_", " ").toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks
                    .filter((task) => filterStatus === "all" || task.status === filterStatus)
                    .map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => handleEditTask(task)} // Pass the full task object here
                            onDelete={() => handleDeleteTask(task.id)}
                        />
                    ))}
            </div>
        </div>
    );
};

export default ProjectDetailsPageClient;
