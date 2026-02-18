import { z } from 'zod';

// --- Base Enums and Unions ---

export const RoomStatusSchema = z.enum(['active', 'paused', 'ended']);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const ParticipantStatusSchema = z.enum(['queued', 'presenting', 'presented', 'withdrawn']);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

export const MediaTypeSchema = z.enum(['image', 'video']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const ClientRoleSchema = z.enum(['presenter', 'admin', 'timer', 'audience', 'participant']);
export type ClientRole = z.infer<typeof ClientRoleSchema>;

export const TimerPhaseSchema = z.enum(['main', 'need']);
export type TimerPhase = z.infer<typeof TimerPhaseSchema>;

export const UploadTypeSchema = z.enum(['profile', 'presentation']);
export type UploadType = z.infer<typeof UploadTypeSchema>;

// --- Core Entities ---

export const RoomSchema = z.object({
  id: z.string(),
  timer_duration: z.number(),
  current_index: z.number(),
  status: RoomStatusSchema,
  current_participant: z.lazy(() => ParticipantSchema.nullable().optional()),
  next_participant: z.lazy(() => ParticipantSchema.nullable().optional()),
  queue_count: z.number().optional(),
  presented_count: z.number().optional(),
  created_at: z.string().optional(),
});
export type Room = z.infer<typeof RoomSchema>;

export const RoomCreateResponseSchema = z.object({
  id: z.string(),
  admin_key: z.string(),
  timer_duration: z.number(),
  created_at: z.string(),
});
export type RoomCreateResponse = z.infer<typeof RoomCreateResponseSchema>;

export const ProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  tagline: z.string().nullable().optional(),
  profile_image_path: z.string().nullable().optional(),
  project_name: z.string().nullable().optional(),
  project_url: z.string().nullable().optional(),
  project_description: z.string().nullable().optional(),
  presentation_media_path: z.string().nullable().optional(),
  media_type: MediaTypeSchema.nullable().optional(),
  current_need: z.string().nullable().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ParticipantSchema = z.object({
  id: z.number(),
  room_id: z.string(),
  profile_id: z.number(),
  name: z.string(),
  tagline: z.string().nullable().optional(),
  profile_image_path: z.string().nullable().optional(),
  project_name: z.string(),
  project_url: z.string().nullable().optional(),
  project_description: z.string(),
  presentation_media_path: z.string().nullable().optional(),
  media_type: MediaTypeSchema.nullable().optional(),
  current_need: z.string().nullable().optional(),
  queue_position: z.number(),
  status: ParticipantStatusSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

export const WaveSchema = z.object({
  id: z.number().optional(),
  room_id: z.string().optional(),
  profile_id: z.number(),
  participant_id: z.number().optional(),
  name: z.string(),
  tagline: z.string().nullable().optional(),
  profile_image_path: z.string().nullable().optional(),
  project_name: z.string().optional(),
  project_url: z.string().nullable().optional(),
});
export type Wave = z.infer<typeof WaveSchema>;

export const WavesResponseSchema = z.object({
  mutual: z.array(WaveSchema),
  sent: z.array(WaveSchema),
  received: z.array(WaveSchema),
});
export type WavesResponse = z.infer<typeof WavesResponseSchema>;

export const SubmissionDataSchema = z.object({
  passphrase: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().optional(),
  project_name: z.string().min(1, 'Project name is required'),
  project_url: z.string().url().or(z.literal('')).optional(),
  project_description: z.string().min(1, 'Project description is required'),
  current_need: z.string().optional(),
  profile_image_path: z.string().nullable().optional(),
  presentation_media_path: z.string().nullable().optional(),
  media_type: MediaTypeSchema.nullable().optional(),
});
export type SubmissionData = z.infer<typeof SubmissionDataSchema>;

export const UploadResponseSchema = z.object({
  path: z.string(),
  media_type: MediaTypeSchema,
  original_name: z.string(),
  size: z.number(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

// --- WebSocket Protocol ---

export const WSMessageSchema = z.looseObject({
  type: z.string(),
});
export type WSMessage = z.infer<typeof WSMessageSchema>;

// Client to Server Messages
export const JoinMessageSchema = WSMessageSchema.extend({
  type: z.literal('join'),
  roomId: z.string(),
  role: ClientRoleSchema,
  passphrase: z.string().optional(),
  adminKey: z.string().optional(),
});
export type JoinMessage = z.infer<typeof JoinMessageSchema>;

export const TimerControlMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_control'),
  action: z.enum(['start', 'stop', 'restart']),
  roomId: z.string(),
  duration: z.number().optional(),
});
export type TimerControlMessage = z.infer<typeof TimerControlMessageSchema>;

export const ClientMessageSchema = z.discriminatedUnion('type', [
  JoinMessageSchema,
  TimerControlMessageSchema,
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// Server to Client Messages
export const WSJoinedMessageSchema = WSMessageSchema.extend({
  type: z.literal('joined'),
  roomId: z.string(),
  role: ClientRoleSchema,
  clientId: z.string(),
  profileId: z.number().optional(),
});
export type WSJoinedMessage = z.infer<typeof WSJoinedMessageSchema>;

export const WSPresenterChangedMessageSchema = WSMessageSchema.extend({
  type: z.literal('presenter_changed'),
  current_participant: ParticipantSchema.nullable(),
  next_participant: ParticipantSchema.nullable(),
  queue_count: z.number(),
  direction: z.enum(['next', 'previous']),
});
export type WSPresenterChangedMessage = z.infer<typeof WSPresenterChangedMessageSchema>;

export const WSTimerStartMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_start'),
  duration: z.number(),
});
export type WSTimerStartMessage = z.infer<typeof WSTimerStartMessageSchema>;

export const WSTimerTickMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_tick'),
  remaining: z.number(),
  phase: TimerPhaseSchema,
});
export type WSTimerTickMessage = z.infer<typeof WSTimerTickMessageSchema>;

export const WSTimerOvertimeMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_overtime'),
  elapsed: z.number(),
});
export type WSTimerOvertimeMessage = z.infer<typeof WSTimerOvertimeMessageSchema>;

export const WSTimerSyncMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_sync'),
  remaining: z.number(),
  duration: z.number(),
  phase: TimerPhaseSchema,
  overtime: z.number(),
  running: z.boolean(),
});
export type WSTimerSyncMessage = z.infer<typeof WSTimerSyncMessageSchema>;

export const WSTimerEndMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_end'),
});
export type WSTimerEndMessage = z.infer<typeof WSTimerEndMessageSchema>;

export const WSTimerClearedMessageSchema = WSMessageSchema.extend({
  type: z.literal('timer_cleared'),
});
export type WSTimerClearedMessage = z.infer<typeof WSTimerClearedMessageSchema>;

export const WSWaveAnimationMessageSchema = WSMessageSchema.extend({
  type: z.literal('wave_animation'),
  participant_id: z.number(),
});
export type WSWaveAnimationMessage = z.infer<typeof WSWaveAnimationMessageSchema>;

export const WSYouAreNextMessageSchema = WSMessageSchema.extend({
  type: z.literal('you_are_next'),
});
export type WSYouAreNextMessage = z.infer<typeof WSYouAreNextMessageSchema>;

export const WSParticipantJoinedMessageSchema = WSMessageSchema.extend({
  type: z.literal('participant_joined'),
  participant: ParticipantSchema,
  queue_count: z.number(),
});
export type WSParticipantJoinedMessage = z.infer<typeof WSParticipantJoinedMessageSchema>;

export const WSParticipantUpdatedMessageSchema = WSMessageSchema.extend({
  type: z.literal('participant_updated'),
  participant: ParticipantSchema,
});
export type WSParticipantUpdatedMessage = z.infer<typeof WSParticipantUpdatedMessageSchema>;

export const WSParticipantWithdrawnMessageSchema = WSMessageSchema.extend({
  type: z.literal('participant_withdrawn'),
  participantId: z.number(),
  queue_count: z.number(),
});
export type WSParticipantWithdrawnMessage = z.infer<typeof WSParticipantWithdrawnMessageSchema>;

export const WSErrorMessageSchema = WSMessageSchema.extend({
  type: z.literal('error'),
  message: z.string(),
  errors: z.record(z.string(), z.any()).optional(),
});
export type WSErrorMessage = z.infer<typeof WSErrorMessageSchema>;

export const ServerMessageSchema = z.union([
  WSJoinedMessageSchema,
  WSPresenterChangedMessageSchema,
  WSTimerStartMessageSchema,
  WSTimerTickMessageSchema,
  WSTimerOvertimeMessageSchema,
  WSTimerSyncMessageSchema,
  WSTimerEndMessageSchema,
  WSTimerClearedMessageSchema,
  WSWaveAnimationMessageSchema,
  WSYouAreNextMessageSchema,
  WSParticipantJoinedMessageSchema,
  WSParticipantUpdatedMessageSchema,
  WSParticipantWithdrawnMessageSchema,
  WSErrorMessageSchema,
]);
export type ServerMessage = z.infer<typeof ServerMessageSchema>;

// --- Helpers ---

/**
 * Transforms a ZodError into a structured tree-like object.
 * Used as an alternative to the deprecated .flatten().
 */
export function treeifyError(error: z.ZodError) {
  return z.treeifyError(error);
}

