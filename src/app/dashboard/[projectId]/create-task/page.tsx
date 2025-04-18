'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateTask() {
  const router = useRouter();
  const { projectId } = useParams();
  const { user } = useAuth();

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error('No user logged in');
      return;
    }

    setLoading(true);

    try {
      // Insert new task into Supabase
      const { error } = await supabase.from('tasks').insert([
        {
          title,
          description,
          status,
          project_id: projectId,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error('Error creating task:', error);
        return;
      }

      // Navigate back to the project board page after task creation
      router.push(`/dashboard/${projectId}`);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Task Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Task Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Task Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          {loading ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
