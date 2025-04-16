'use client';

import { useState } from 'react';
import { getAITaskSuggestions, generateProjectSummary, prioritizeTasks } from '@/lib/ai';
import { Task, Project } from '../types';

interface AIFeaturesProps {
  project: Project;
  onAddTask: (title: string) => void;
}

export default function AIFeatures({ project, onAddTask }: AIFeaturesProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const aiSuggestions = await getAITaskSuggestions(project);
      setSuggestions(aiSuggestions);
    } catch (err) {
      setError('Failed to get AI suggestions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const aiSummary = await generateProjectSummary(project);
      setSummary(aiSummary);
    } catch (err) {
      setError('Failed to generate project summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrioritizeTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const prioritizedTasks = await prioritizeTasks(project.tasks);
      // Update tasks in the parent component
      // This would need to be implemented based on your state management
    } catch (err) {
      setError('Failed to prioritize tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleGetSuggestions}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Get Task Suggestions
            </button>
            
            {suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Suggested Tasks:</h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{suggestion}</span>
                      <button
                        onClick={() => onAddTask(suggestion)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Add Task
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handleGetSummary}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Generate Project Summary
            </button>
            
            {summary && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Project Summary:</h4>
                <p className="text-gray-700">{summary}</p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handlePrioritizeTasks}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Prioritize Tasks
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 