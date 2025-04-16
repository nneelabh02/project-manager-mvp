"use client";

// src/components/TaskForm.tsx

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the TaskFormProps interface with a strict status type
interface TaskFormProps {
  onAddTask: (title: string, description: string, status: "todo" | "in_progress" | "done", dueDate?: string, reminderDate?: string, reminderEnabled?: boolean) => void;
}

const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(
        title.trim(),
        description.trim(),
        status,
        dueDate?.toISOString(),
        reminderEnabled ? reminderDate?.toISOString() : undefined,
        reminderEnabled
      );
      setTitle("");
      setDescription("");
      setStatus("todo");
      setDueDate(null);
      setReminderDate(null);
      setReminderEnabled(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter task title"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter task description"
          rows={3}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "done")}
          className="w-full p-2 border rounded"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <DatePicker
          selected={dueDate}
          onChange={setDueDate}
          minDate={new Date()}
          className="w-full p-2 border rounded"
          dateFormat="MMMM d, yyyy"
          placeholderText="Select due date"
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="reminderEnabled"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
            Enable Reminder
          </label>
        </div>
        {reminderEnabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Date
            </label>
            <DatePicker
              selected={reminderDate}
              onChange={setReminderDate}
              minDate={new Date()}
              maxDate={dueDate || undefined}
              className="w-full p-2 border rounded"
              dateFormat="MMMM d, yyyy"
              placeholderText="Select reminder date"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
