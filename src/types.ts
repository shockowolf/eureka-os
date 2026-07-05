export type Theme = 'classic-gray' | 'meadow-blue' | 'atelier';
export type AppId = 'agentroom' | 'uniplan' | 'documents' | 'notes' | 'gamelab' | 'terminal' | 'settings';

// Shared view-model types. Keep these UI-focused; avoid coupling them to server/API shapes.
export type AppMeta = { title: string; icon: string; accent: string; summary: string };
export type WindowState = { id: AppId; z: number; x: number; y: number; minimized?: boolean; maximized?: boolean };
export type DragState = { id: AppId; startX: number; startY: number; originX: number; originY: number };
export type GameRegistryItem = { id: string; title: string; license: string; status: string; bundlePath?: string; notes?: string };
export type LinkTarget = { label: string; url: string; description: string };
export type AgentCard = { name: string; role: string; status: string; next: string; accent: string; capability: string };
export type WorkCard = { title: string; status: string; description: string; linkLabel: string; url: string };
export type AgentRoomRoom = { id: string; name: string; meta: string; purpose: string; health: 'active' | 'quiet' | 'blocked' | 'review' };
export type AgentRoomMessage = { roomId: string; author: string; role: string; body: string; tone?: 'user' | 'agent' | 'system' | 'decision' };
export type AgentRoomTaskStatus = 'open' | 'in_progress' | 'blocked' | 'needs_approval' | 'done';
export type AgentRoomTask = { id: string; title: string; assignee: string; status: AgentRoomTaskStatus; resource: string; next: string; priority?: 'low' | 'normal' | 'high'; finalSummary?: string; approvalState?: 'none' | 'pending' | 'approved' | 'rejected' | 'revise'; todos?: string[]; decisions?: string[] };
export type AgentRoomLock = { resource: string; holder: string; mode: 'shared' | 'exclusive'; until: string; reason: string };
export type AgentRoomDecision = { id: string; label: string; owner: string; detail: string; status: 'decided' | 'pending' | 'blocked' };
export type AgentRoomPrompt = { label: string; text: string };
export type AgentRoomFileTrigger = { id: string; patterns: string[]; bots: string[]; reason: string; status: 'ready' | 'needs_hook' | 'done'; command: string };

// js-dos is loaded at runtime from /public/js-dos instead of bundled by Vite.
// The public API is intentionally minimal here because Eureka OS only needs start/stop/save hooks.
export type DosPlayer = { stop?: () => Promise<void>; save?: () => Promise<unknown> };
export type DosLauncher = (root: HTMLElement, options: Record<string, unknown>) => DosPlayer;
