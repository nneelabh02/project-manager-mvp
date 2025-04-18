"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import { Database } from "@/types/supabase";

// Define the Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  dueDate?: string;
  reminderDate?: string;
  reminderEnabled?: boolean;
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
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
  };

  const handleDelete = () => {
    console.log("Delete clicked for task:", task.id);
    onDelete(task.id);
  };

  const handleEdit = () => {
    console.log("Edit clicked for task:", task.id);
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log("Save clicked for task:", editedTask.id);
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="space-y-4">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Task title"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Task description"
          />
          <select
            value={editedTask.status}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task["status"] })}
            className="w-full p-2 border rounded"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {/* Dedicated drag handle */}
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab p-1 text-gray-400 hover:text-gray-600"
            aria-label="Drag to reorder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2">
        <span className={`inline-block px-2 py-1 rounded text-white text-sm ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};

const ProjectDetailsContent = ({ projectId }: ProjectDetailsContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError(fetchError.message || 'Failed to load tasks');
        return;
      }

      setTasks(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string, description: string, status: "todo" | "in_progress" | "done", dueDate?: string, reminderDate?: string, reminderEnabled?: boolean) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User authentication error:', userError);
        setError('Not authenticated');
        return;
      }

      const userId = user.id;
      
      // First check if the project exists and belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (projectError || !project) {
        console.error('Project verification error:', projectError);
        setError('Project not found or access denied');
        return;
      }

      // Now insert the task
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            status,
            project_id: projectId,
            due_date: dueDate ? new Date(dueDate).toISOString() : null
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Task added successfully:', data);
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      if (error instanceof Error) {
        setError(`Failed to add task: ${error.message}`);
      } else {
        setError('Failed to add task: Unknown error occurred');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log('Deleting task with ID:', taskId);

      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      console.log('Task deleted successfully:', data);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      console.log('Editing task with data:', {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString() : null
      });

      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString() : null
        })
        .eq('id', updatedTask.id)
        .select();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);
        
        return arrayMove(tasks, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <TaskForm onAddTask={handleAddTask} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default ProjectDetailsContent; 