"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import TaskForm from "@/components/TaskForm";
import { logActivity } from "@/utils/activities";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  project_id: string;
  created_at: string;
  completed_at?: string;
  due_date?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface ProjectDetailsContentProps {
  projectId: string;
}

const SortableTaskCard = ({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (taskId: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'todo':
        return 'w-1/3';
      case 'in_progress':
        return 'w-2/3';
      case 'done':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg mb-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div 
          className="flex-1 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600">{task.description}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          {task.due_date && (
            <p className="text-sm text-gray-500 mt-2">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${getStatusColor(task.status).replace('text', 'bg')} ${getProgressWidth(task.status)}`}></div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailsContent = ({ projectId }: ProjectDetailsContentProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const supabase = createClientComponentClient<Database>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchProject = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    }
  }, [projectId, supabase]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You must be logged in to view tasks");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [projectId, supabase]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [fetchProject, fetchTasks]);

  const handleAddTask = async (title: string, description: string, status: string = 'todo') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to add tasks');
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          title,
          description,
          project_id: projectId,
          status,
          created_at: new Date().toISOString(),
          completed_at: status === 'done' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity({
        type: 'task_create',
        task_id: task.id,
        project_id: projectId,
        task_title: title,
        project_title: project?.title || ''
      });

      setTasks(prev => [...prev, task]);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = async (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveEdit = async (updatedTask: Task) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to edit tasks');
      }

      const oldTask = tasks.find(t => t.id === updatedTask.id);
      if (!oldTask) {
        console.error('Task not found:', updatedTask.id);
        return;
      }

      const { data: savedTask, error } = await supabase
        .from('tasks')
        .update({
          ...updatedTask,
          completed_at: updatedTask.status === 'done' ? new Date().toISOString() : null
        })
        .eq('id', updatedTask.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      // Log activity
      await logActivity({
        type: 'task_update',
        task_id: updatedTask.id,
        project_id: projectId,
        task_title: updatedTask.title,
        project_title: project?.title || '',
        old_status: oldTask.status,
        new_status: updatedTask.status
      });

      setTasks(prev => prev.map(t => t.id === updatedTask.id ? savedTask : t));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error instanceof Error ? error.message : 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to delete tasks');
      }

      // First delete related activities
      const { error: activitiesError } = await supabase
        .from('activities')
        .delete()
        .eq('task_id', taskId);

      if (activitiesError) {
        console.error('Error deleting related activities:', activitiesError);
        throw new Error(`Failed to delete related activities: ${activitiesError.message}`);
      }

      // Then delete the task
      const { error: taskError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (taskError) {
        console.error("Error deleting task:", taskError);
        throw new Error(`Failed to delete task: ${taskError.message}`);
      }

      // Log activity for the deletion
      await logActivity({
        type: 'task_delete',
        project_id: projectId,
        project_title: project?.title || ''
      });

      // Update local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(error instanceof Error ? error.message : 'Failed to delete task. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over?.id);
        
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        
        // Update task order in database
        newTasks.forEach(async (task, index) => {
          try {
            await supabase
              .from('tasks')
              .update({ order: index })
              .eq('id', task.id);
          } catch (error) {
            console.error('Error updating task order:', error);
          }
        });
        
        return newTasks;
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

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Edit Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveEdit({
                ...editingTask,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                status: formData.get('status') as string,
              });
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTask.title}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingTask.description}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={editingTask.status}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsContent; 