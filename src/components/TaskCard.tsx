"use client";

// src/components/TaskCard.tsx
import React, { useState } from "react";
import { Task } from "@/types"; // Assuming Task type is defined elsewhere
import { Button } from "@/components/ui/button";
import { FaCheck, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

interface TaskCardProps {
  task: Task;
  onEdit: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

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

  const handleDelete = () => {
    onDelete(task.id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isEditing) {
    return (
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
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <DatePicker
            selected={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
            onChange={(date) => setEditedTask({ ...editedTask, dueDate: date?.toISOString() })}
            minDate={new Date()}
            className="w-full p-2 border rounded"
            placeholderText="Select due date"
            dateFormat="MMMM d, yyyy"
          />
        </div>
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
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <FaTrash className="text-red-500" />
          </Button>
        </div>
      </div>
      <p className="text-gray-600 mb-2">{task.description}</p>
      {task.dueDate && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
        <span className="text-sm capitalize">{task.status.replace('_', ' ')}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getStatusColor(task.status)}`}
          style={{ width: `${getProgressPercentage(task.status)}%` }}
        />
      </div>
    </div>
  );
};

export default TaskCard;
