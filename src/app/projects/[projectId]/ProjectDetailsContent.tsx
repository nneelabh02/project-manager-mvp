"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

// Define the Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
}

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return "bg-gray-500";
    case "in_progress":
      return "bg-blue-500";
    case "done":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getProgressPercentage = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return 0;
    case "in_progress":
      return 50;
    case "done":
      return 100;
    default:
      return 0;
  }
};

interface ProjectDetailsContentProps {
  projectId: string;
}

// Sortable Task Card component
const SortableTaskCard = ({ task, onEdit, onDelete }: { task: Task; onEdit: (updatedTask: Task) => void; onDelete: (taskId: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
    cursor: 'grab',
    touchAction: 'none',
    transformOrigin: '0 0',
    willChange: 'transform',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
  };

  const handleDelete = () => {
    console.log("Delete clicked for task:", task.id);
    onDelete(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            placeholder="Task title"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            placeholder="Task description"
          />
          <select
            value={editedTask.status}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task["status"] })}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={handleEdit}
          className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm"
        >
          Delete
        </button>
      </div>
      <div {...attributes} {...listeners} className="cursor-move">
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} text-white`}>
                {task.status.replace("_", " ").toUpperCase()}
              </span>
              <h3 className="text-lg font-semibold flex-grow">{task.title}</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{task.description}</p>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getStatusColor(task.status)}`}
              style={{ width: `${getProgressPercentage(task.status)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailsContent = ({ projectId }: ProjectDetailsContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "todo" | "in_progress" | "done">("all");

  // Set up sensors for drag and drop with improved configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks from Supabase on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .order('order', { ascending: true });

        if (error) {
          console.error("Error fetching tasks:", error);
        } else if (data) {
          setTasks(data as Task[]);
        }
      } catch (err) {
        console.error("Unexpected error while fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  // Handle adding a task
  const handleAddTask = async (title: string, description: string, status: "todo" | "in_progress" | "done") => {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, description, status, project_id: projectId }])
      .single();

    if (error) {
      console.error("Error adding task:", error.message);
    } else {
      setTasks((prevTasks) => [...prevTasks, data]);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log("Deleting task:", taskId);
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("project_id", projectId); // Add project_id check for safety

      if (error) {
        console.error("Error deleting task:", error);
        return;
      }

      // Update local state only after successful deletion
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      console.log("Task deleted successfully");
    } catch (err) {
      console.error("Unexpected error while deleting task:", err);
    }
  };

  // Handle task editing
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

  // Handle drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update the order in the database
        const updates = newItems.map((task, index) => ({
          id: task.id,
          order: index,
          project_id: projectId,
          title: task.title,
          description: task.description,
          status: task.status
        }));
        
        // Update database asynchronously
        supabase
          .from("tasks")
          .upsert(updates, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) {
              console.error("Error updating task order:", error.message);
            }
          });
        
        return newItems;
      });
    }
  };

  const filteredTasks = tasks && tasks.length > 0
    ? tasks.filter((task) => task && (filterStatus === "all" || task?.status === filterStatus))
    : [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Project Tasks</h1>
      </div>

      {/* Task Form */}
      <TaskForm onAddTask={handleAddTask} />

      {/* Filter Buttons */}
      <div className="flex gap-4 my-6">
        {["all", "todo", "in_progress", "done"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as "all" | "todo" | "in_progress" | "done")}
            className={`px-4 py-2 rounded-lg ${filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {status === "all" ? "All" : status.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300">
              {filteredTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default ProjectDetailsContent; 