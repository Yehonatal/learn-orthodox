import { createClient } from '@/lib/supabase/client';

export interface StudyNote {
  id: string;
  unit_id?: string | null;
  liturgy_slug: string;
  section_slug: string;
  passage_gez?: string | null;
  passage_am?: string | null;
  passage_en?: string | null;
  title: string;
  commentary_core?: string | null;
  commentary_context?: string | null;
  commentary_symbolism?: string | null;
  user_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_STORAGE_KEY = 'learn_orthodox_study_notes';

// Helper to generate a client-side UUID
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

// Get all notes from both LocalStorage and Supabase, merging them by ID
export async function getStudyNotes(): Promise<StudyNote[]> {
  let localNotes: StudyNote[] = [];
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        localNotes = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse local notes:', e);
      }
    }
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('study_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notes error:', error.message);
      return localNotes;
    }

    if (data) {
      const dbNotes: StudyNote[] = data.map(item => ({
        id: item.id,
        unit_id: item.unit_id,
        liturgy_slug: item.liturgy_slug,
        section_slug: item.section_slug,
        passage_gez: item.passage_gez,
        passage_am: item.passage_am,
        passage_en: item.passage_en,
        title: item.title,
        commentary_core: item.commentary_core,
        commentary_context: item.commentary_context,
        commentary_symbolism: item.commentary_symbolism,
        user_notes: item.user_notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      // Merge local and DB notes. DB notes take precedence, but preserve local-only notes
      const mergedMap = new Map<string, StudyNote>();
      localNotes.forEach(n => mergedMap.set(n.id, n));
      dbNotes.forEach(n => mergedMap.set(n.id, n));

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      // Sync back to local storage to keep them updated
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedList));
      }

      return mergedList;
    }
  } catch (err) {
    console.warn('Supabase offline or failed, returning local notes:', err);
  }

  return localNotes;
}

// Save or Create a study note
export async function saveStudyNote(note: Omit<StudyNote, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<StudyNote> {
  const finalId = note.id || generateUUID();
  const timestamp = new Date().toISOString();

  const finalNote: StudyNote = {
    ...note,
    id: finalId,
    created_at: note.id ? undefined : timestamp,
    updated_at: timestamp
  };

  // 1. Save locally first
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let localNotes: StudyNote[] = [];
    if (raw) {
      try { localNotes = JSON.parse(raw); } catch {}
    }

    const index = localNotes.findIndex(n => n.id === finalId);
    if (index >= 0) {
      localNotes[index] = { ...localNotes[index], ...finalNote, updated_at: timestamp };
    } else {
      localNotes.unshift(finalNote);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localNotes));
  }

  // 2. Save to Supabase
  try {
    const supabase = createClient();
    const payload = {
      id: finalNote.id,
      unit_id: finalNote.unit_id,
      liturgy_slug: finalNote.liturgy_slug,
      section_slug: finalNote.section_slug,
      passage_gez: finalNote.passage_gez,
      passage_am: finalNote.passage_am,
      passage_en: finalNote.passage_en,
      title: finalNote.title,
      commentary_core: finalNote.commentary_core,
      commentary_context: finalNote.commentary_context,
      commentary_symbolism: finalNote.commentary_symbolism,
      user_notes: finalNote.user_notes,
      updated_at: timestamp
    };

    const { error } = await supabase
      .from('study_notes')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save note failed:', error.message);
    }
  } catch (err) {
    console.warn('Failed to upsert note in remote DB:', err);
  }

  return finalNote;
}

// Delete a study note
export async function deleteStudyNote(id: string): Promise<boolean> {
  // 1. Delete locally
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        let localNotes: StudyNote[] = JSON.parse(raw);
        localNotes = localNotes.filter(n => n.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localNotes));
      } catch {}
    }
  }

  // 2. Delete from Supabase
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('study_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete note error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete note from remote DB:', err);
    return false;
  }
}

// Fetch a single note by ID (for sharing or individual loading)
export async function getStudyNoteById(id: string): Promise<StudyNote | null> {
  // Try local first
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const localNotes: StudyNote[] = JSON.parse(raw);
        const found = localNotes.find(n => n.id === id);
        if (found) return found;
      } catch {}
    }
  }

  // Fetch from DB
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('study_notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Supabase fetch single note error:', error.message);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        unit_id: data.unit_id,
        liturgy_slug: data.liturgy_slug,
        section_slug: data.section_slug,
        passage_gez: data.passage_gez,
        passage_am: data.passage_am,
        passage_en: data.passage_en,
        title: data.title,
        commentary_core: data.commentary_core,
        commentary_context: data.commentary_context,
        commentary_symbolism: data.commentary_symbolism,
        user_notes: data.user_notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }
  } catch (err) {
    console.warn('Failed to query note by ID:', err);
  }

  return null;
}
