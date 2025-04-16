'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigating
import { useParams } from 'next/navigation'; // For getting projectId and taskId
import { supabase } from '@/utils/supabaseClient'; // Your supabase client

export default function EditTask() {
  const router = useRouter();
  const { projectId, taskId } = useParams(); // Get projectId and taskId from URL params

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('1');
  const [loading, setLoading] = useState(true);

  // Fetch task details when page loads
  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        setLoading(false);
        return;
      }

      // Set state with fetched task data
      setTitle(data.title);
      setDescription(data.description);
      setStatus(data.status);
      setDueDate(data.due_date || '');
      if (data.due_date && data.reminder_date) {
        const dueDate = new Date(data.due_date);
        const reminderDate = new Date(data.reminder_date);
        const daysDiff = Math.ceil((dueDate.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24));
        setReminderTime(daysDiff.toString());
      }
      setLoading(false);
    };

    fetchTask();
  }, [taskId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Calculate reminder date based on due date and reminder time
    const reminderDate = dueDate ? new Date(dueDate) : null;
    if (reminderDate) {
      reminderDate.setDate(reminderDate.getDate() - parseInt(reminderTime));
    }

    // Update task in Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ 
        title, 
        description, 
        status,
        due_date: dueDate,
        reminder_date: reminderDate?.toISOString()
      })
      .eq('id', taskId);

    setLoading(false);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    // Navigate back to the project board page after updating the task
    router.push(`/dashboard/${projectId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

      {/* Loading State */}
      {loading && <div>Loading task details...</div>}

      {/* Edit Task Form */}
      {!loading && (
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

          <div>
            <label className="block text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {dueDate && (
            <div>
              <label className="block text-sm font-medium">Remind me</label>
              <select
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
                <option value="14">2 weeks before</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            {loading ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}
