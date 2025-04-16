"use client";

// src/components/TaskForm.tsx

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define the TaskFormProps interface with a strict status type
interface TaskFormProps {
  onAddTask: (title: string, description: string, status: "todo" | "in_progress" | "done", dueDate?: Date) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the values with the correct type to onAddTask
    onAddTask(title, description, status, dueDate || undefined);
    setTitle("");
    setDescription("");
    setStatus("todo"); // Reset to "todo" after submission
    setDueDate(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col mb-4">
        <label htmlFor="title" className="font-semibold">Task Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded"
          required
        />
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="description" className="font-semibold">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded"
          required
        />
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="status" className="font-semibold">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "done")}
          className="p-2 border rounded"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="dueDate" className="font-semibold">Due Date</label>
        <DatePicker
          id="dueDate"
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          minDate={new Date()}
          className="p-2 border rounded w-full"
          placeholderText="Select due date"
          dateFormat="MMMM d, yyyy"
        />
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Task</button>
    </form>
  );
};

export default TaskForm;
