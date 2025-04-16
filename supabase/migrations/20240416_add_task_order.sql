-- Add order column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Update existing tasks with sequential order based on creation time
WITH ordered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num
  FROM tasks
)
UPDATE tasks
SET "order" = ordered_tasks.row_num
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id; 