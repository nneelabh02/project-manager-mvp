export type Task = {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
};

export type Project = {
    id: string;
    title: string;
    description?: string;
    created_at: string;
    user_id: string;
    tasks: Task[];
}; 