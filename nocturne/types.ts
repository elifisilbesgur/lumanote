export type Attachment = { id: string; uri: string; name: string; type: 'image' | 'pdf' | 'audio'; mimeType?: string; size?: number };
export type Plan = { id: string; title: string; kind: 'study'|'reminder'|'task'|'event'; date: string; time: string; durationMinutes: number; icon?: string; noteId?: string; repeat?: 'none'|'daily'|'weekdays'|'weekly'; reminderMinutes?: number; completed?: boolean; completedDates?: Record<string, boolean>; notificationIds?: string[]; notificationStatus?: string };
export type AudioSettings = { playing: boolean; volumes: Record<string, number>; customAudio?: Attachment | null };
export type AppData = { schema?: number; notes: Array<{ id: string; attachments?: Attachment[]; [key: string]: unknown }>; planner: Plan[]; focusHistory: unknown[]; preferences?: Record<string, unknown>; [key: string]: unknown };
export type BridgeMessage = { id: string; type: string; payload: Record<string, any> };
export type NativeEvent = { type: string; payload?: any };
export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.notes) && Array.isArray(v.planner) && Array.isArray(v.focusHistory);
}
