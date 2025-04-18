import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

type ActivityType = 'task_create' | 'task_update' | 'task_delete' | 'project_update';

interface ActivityData {
  type: ActivityType;
  task_id?: string;
  project_id: string;
  task_title?: string;
  project_title: string;
  old_status?: string;
  new_status?: string;
}

export async function logActivity(activityData: ActivityData) {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found when logging activity');
      return;
    }

    const { error } = await supabase
      .from('activities')
      .insert([{
        ...activityData,
        user_id: session.user.id
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getRecentActivities(limit = 50) {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
} 