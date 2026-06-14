import { createClient } from '@/lib/supabase/client';
import { VideoLesson, VideoNote } from '@/types/video';

const LOCAL_STORAGE_KEY_NOTES = 'learn_orthodox_video_notes';

function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get all video lessons
export async function getVideoLessons(): Promise<VideoLesson[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('video_lessons')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch videos error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch videos from Supabase:', err);
    return [];
  }
}

// Get all notes for a specific video
export async function getVideoNotes(videoId: string): Promise<VideoNote[]> {
  let localNotes: VideoNote[] = [];
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    if (raw) {
      try {
        localNotes = JSON.parse(raw).filter((n: VideoNote) => n.video_id === videoId);
      } catch (e) {
        console.error('Failed to parse local video notes:', e);
      }
    }
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('video_notes')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp_seconds', { ascending: true });

    if (error) {
      console.warn('Supabase fetch video notes error:', error.message);
      return localNotes;
    }

    if (data) {
      const dbNotes: VideoNote[] = data;
      const mergedMap = new Map<string, VideoNote>();
      localNotes.forEach(n => mergedMap.set(n.id, n));
      dbNotes.forEach(n => mergedMap.set(n.id, n));

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => a.timestamp_seconds - b.timestamp_seconds
      );

      // Update local storage for this video
      if (typeof window !== 'undefined') {
        const fullRaw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
        let fullLocalList: VideoNote[] = [];
        if (fullRaw) {
          try { fullLocalList = JSON.parse(fullRaw); } catch {}
        }
        const filteredList = fullLocalList.filter(n => n.video_id !== videoId);
        localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify([...filteredList, ...mergedList]));
      }

      return mergedList;
    }
  } catch (err) {
    console.warn('Supabase offline or failed, returning local video notes:', err);
  }

  return localNotes;
}

// Save or Create a video note
export async function saveVideoNote(note: Omit<VideoNote, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<VideoNote> {
  const finalId = note.id || generateUUID();
  const timestamp = new Date().toISOString();

  const finalNote: VideoNote = {
    ...note,
    id: finalId,
    created_at: note.id ? undefined : timestamp,
    updated_at: timestamp
  };

  // 1. Save locally
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    let localNotes: VideoNote[] = [];
    if (raw) {
      try { localNotes = JSON.parse(raw); } catch {}
    }

    const index = localNotes.findIndex(n => n.id === finalId);
    if (index >= 0) {
      localNotes[index] = { ...localNotes[index], ...finalNote, updated_at: timestamp };
    } else {
      localNotes.unshift(finalNote);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(localNotes));
  }

  // 2. Save to Supabase
  try {
    const supabase = createClient();
    const payload = {
      id: finalNote.id,
      video_id: finalNote.video_id,
      title: finalNote.title,
      user_notes: finalNote.user_notes,
      timestamp_seconds: finalNote.timestamp_seconds,
      updated_at: timestamp
    };

    const { error } = await supabase
      .from('video_notes')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save video note failed:', error.message);
    }
  } catch (err) {
    console.warn('Failed to upsert video note in remote DB:', err);
  }

  return finalNote;
}

// Delete a video note
export async function deleteVideoNote(id: string): Promise<boolean> {
  // 1. Delete locally
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    if (raw) {
      try {
        let localNotes: VideoNote[] = JSON.parse(raw);
        localNotes = localNotes.filter(n => n.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(localNotes));
      } catch {}
    }
  }

  // 2. Delete from Supabase
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('video_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete video note error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete video note from remote DB:', err);
    return false;
  }
}
