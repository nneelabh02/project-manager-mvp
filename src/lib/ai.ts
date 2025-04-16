import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
}

interface Project {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
}

export async function getAITaskSuggestions(project: Project): Promise<string[]> {
  try {
    const prompt = `Given the following project and its tasks, suggest 3 relevant new tasks that would help complete the project:
    
    Project: ${project.title}
    ${project.description ? `Description: ${project.description}` : ''}
    
    Current Tasks:
    ${project.tasks.map(task => `- ${task.title} (${task.status})`).join('\n')}
    
    Suggest 3 new tasks that would complement the existing ones. Return only the task titles, one per line.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const suggestions = completion.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3) || [];

    return suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [];
  }
}

export async function prioritizeTasks(tasks: Task[]): Promise<Task[]> {
  try {
    const prompt = `Given the following tasks, prioritize them based on their titles and descriptions. Consider dependencies, complexity, and importance:
    
    Tasks:
    ${tasks.map(task => `- ${task.title}: ${task.description || 'No description'}`).join('\n')}
    
    Return the same tasks in order of priority, with the most important tasks first. Return only the task titles in order, one per line.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const prioritizedTitles = completion.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];

    // Reorder tasks based on AI prioritization
    return tasks.sort((a, b) => {
      const aIndex = prioritizedTitles.indexOf(a.title);
      const bIndex = prioritizedTitles.indexOf(b.title);
      return aIndex - bIndex;
    });
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    return tasks;
  }
}

export async function generateProjectSummary(project: Project): Promise<string> {
  try {
    const prompt = `Generate a concise summary of the following project, including its progress and next steps:
    
    Project: ${project.title}
    ${project.description ? `Description: ${project.description}` : ''}
    
    Tasks:
    ${project.tasks.map(task => `- ${task.title} (${task.status})`).join('\n')}
    
    Provide a brief summary (2-3 sentences) of the project's current state and what needs to be done next.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'Unable to generate summary';
  } catch (error) {
    console.error('Error generating project summary:', error);
    return 'Error generating summary';
  }
} 