import type { WebSocket } from 'ws';
import type {
  RoomStatus,
  ParticipantStatus,
  MediaType,
  ClientRole,
  TimerPhase,
} from '@nextup/shared';

export * from '@nextup/shared';

// Database row types
export interface RoomRow {
  id: string;
  admin_key: string;
  timer_duration: number;
  current_index: number;
  status: RoomStatus;
  created_at: string;
}

export interface ProfileRow {
  id: number;
  passphrase: string;
  name: string;
  tagline: string | null;
  profile_image_path: string | null;
  project_name: string | null;
  project_url: string | null;
  project_description: string | null;
  presentation_media_path: string | null;
  media_type: MediaType | null;
  current_need: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantRow {
  id: number;
  room_id: string;
  profile_id: number;
  name: string;
  tagline: string | null;
  profile_image_path: string | null;
  project_name: string;
  project_url: string | null;
  project_description: string;
  presentation_media_path: string | null;
  media_type: MediaType | null;
  current_need: string | null;
  queue_position: number;
  status: ParticipantStatus;
  created_at: string;
  updated_at: string;
}

export interface WaveRow {
  id: number;
  room_id: string;
  from_profile_id: number;
  to_participant_id: number;
  waved_during_presentation: number; // SQLite boolean
  created_at: string;
}

export interface WaveWithParticipantInfo extends WaveRow {
  name: string;
  tagline: string | null;
  profile_image_path: string | null;
  project_name: string;
  project_url: string | null;
}

export interface WaveWithProfileInfo extends WaveRow {
  name: string;
  tagline: string | null;
  profile_image_path: string | null;
}

// WebSocket types
export interface WSClient {
  ws: ExtendedWebSocket;
  role: ClientRole;
  profileId?: number;
}

export interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  clientId?: string;
  roomId?: string;
  role?: ClientRole;
  profileId?: number;
}

export interface TimerState {
  running: boolean;
  duration: number;
  remaining: number;
  phase: TimerPhase;
  overtime: number;
  interval: NodeJS.Timeout | null;
}

// Express extended types
export interface WebSocketManagerInterface {
  broadcastToRoom(roomId: string, data: object): void;
  broadcastToRoles(roomId: string, roles: ClientRole[], data: object): void;
  notifyParticipant(roomId: string, profileId: number, data: object): void;
  startTimer(roomId: string, duration?: number): void;
  stopTimer(roomId: string): void;
  restartTimer(roomId: string, duration?: number): void;
  close(): void;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Application {
      get(name: 'wsManager'): WebSocketManagerInterface | undefined;
      set(name: 'wsManager', value: WebSocketManagerInterface): void;
    }
  }
}

export interface CountResult {
  count: number;
}

export interface NextPositionResult {
  next_position: number;
}

// Request parameter types
export interface RoomParams {
  roomId: string;
}

export interface ParticipantParams extends RoomParams {
  participantId: string;
}

export interface PassphraseParams {
  passphrase: string;
}
