export interface VideoLesson {
  id: string;
  youtube_video_id: string;
  start_time: number;
  title: string;
  teacher_name: string | null;
  priority: number;
  subject: string;
  created_at?: string;
}

export interface VideoNote {
  id: string;
  video_id: string;
  title: string;
  user_notes: string | null;
  timestamp_seconds: number;
  created_at?: string;
  updated_at?: string;
}
