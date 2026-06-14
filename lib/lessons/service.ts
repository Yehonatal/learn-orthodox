import { createClient } from '@/lib/supabase/client';
import { OrthodoxLesson, ChurchFather } from '@/types/lessons';

export async function getOrthodoxLessons(): Promise<OrthodoxLesson[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orthodox_lessons')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch lessons error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch lessons from Supabase:', err);
    return [];
  }
}

export async function getChurchFathers(): Promise<ChurchFather[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('church_fathers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetch church fathers error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch church fathers from Supabase:', err);
    return [];
  }
}
