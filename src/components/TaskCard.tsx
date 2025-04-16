"use client";

// src/components/TaskCard.tsx
import React, { useState } from "react";
import { Task } from "@/types"; // Assuming Task type is defined elsewhere
import { Button } from "@/components/ui/button";
import { FaCheck, FaTrash } from "react-icons/fa";

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
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} text-white`}>
          {task.status.replace("_", " ").toUpperCase()}
        </span>
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
  );
};

export default TaskCard;
