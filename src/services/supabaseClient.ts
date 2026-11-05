import { createClient } from '@supabase/supabase-js';
import { Contact, Activity, TaskPending, User } from '../types';

export const SUPABASE_URL = 'https://liomjpoclsdxcjnnxqhi.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_VHM7zdpXTaP4UAlUsxwmjQ_m3GxYih9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Cloud Sync helpers for real-time multi-device sync
 */

// 1. Sync Contact to Supabase (including Soft Delete flag)
export async function syncContactToCloud(contact: Contact): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contacts')
      .upsert({
        id: contact.id,
        user_id: contact.userId,
        branch: contact.branch,
        name: contact.name,
        phone: contact.phone,
        source: contact.source,
        status: contact.status,
        deleted_by_advisor: Boolean(contact.deletedByAdvisor),
        deleted_at: contact.deletedAt || null,
        created_at: contact.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync contact warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase contact network error:', err);
    return false;
  }
}

// 2. Sync Activity to Supabase
export async function syncActivityToCloud(activity: Activity): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('activities')
      .upsert({
        id: activity.id,
        user_id: activity.userId,
        contact_id: activity.contactId || null,
        activity_type: activity.activityType,
        package_offered_id: activity.packageOfferedId || null,
        result: activity.result,
        objection: activity.objection || null,
        notes: activity.notes || null,
        created_at: activity.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync activity warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase activity network error:', err);
    return false;
  }
}

// 3. Sync Task to Supabase
export async function syncTaskToCloud(task: TaskPending): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .upsert({
        id: task.id,
        user_id: task.userId,
        contact_id: task.contactId || null,
        contact_name: task.contactName || '',
        contact_phone: task.contactPhone || '',
        due_date: task.dueDate,
        due_time: task.dueTime || null,
        notes: task.notes || null,
        is_completed: Boolean(task.isCompleted),
        created_at: task.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync task warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase task network error:', err);
    return false;
  }
}

// 4. Sync User to Supabase
export async function syncUserToCloud(user: User): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name: user.name,
        username: user.username || null,
        email: user.email,
        password: user.password || null,
        role: user.role,
        branch: user.branch,
        active: user.active ?? true,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase sync user warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase user network error:', err);
    return false;
  }
}

// 5. Pull all cloud data from Supabase
export async function pullCloudData(): Promise<{
  contacts: Contact[];
  activities: Activity[];
  tasks: TaskPending[];
  users: User[];
} | null> {
  try {
    const [cRes, aRes, tRes, uRes] = await Promise.all([
      supabase.from('contacts').select('*'),
      supabase.from('activities').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('users').select('*')
    ]);

    const contacts: Contact[] = (cRes.data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      branch: row.branch,
      name: row.name,
      phone: row.phone,
      source: row.source,
      status: row.status,
      deletedByAdvisor: Boolean(row.deleted_by_advisor),
      deletedAt: row.deleted_at,
      createdAt: row.created_at
    }));

    const activities: Activity[] = (aRes.data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      contactId: row.contact_id || '',
      contactName: row.contact_name || 'Contacto',
      contactPhone: row.contact_phone || '',
      source: (row.source || 'frio') as any,
      activityType: row.activity_type,
      packageOfferedId: row.package_offered_id || '',
      packageOfferedName: row.package_offered_name || 'Plan Previsión',
      result: row.result,
      objection: row.objection,
      notes: row.notes,
      createdAt: row.created_at
    }));

    const tasks: TaskPending[] = (tRes.data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      contactId: row.contact_id || '',
      contactName: row.contact_name || '',
      contactPhone: row.contact_phone || '',
      dueDate: row.due_date,
      dueTime: row.due_time || '10:00',
      taskType: (row.task_type || 'llamada') as any,
      notes: row.notes,
      isCompleted: Boolean(row.is_completed),
      createdAt: row.created_at
    }));

    const users: User[] = (uRes.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      branch: row.branch,
      active: row.active
    }));

    return { contacts, activities, tasks, users };
  } catch (err) {
    console.warn('Error pulling cloud data:', err);
    return null;
  }
}
