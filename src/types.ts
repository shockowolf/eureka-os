export type Theme = 'classic-gray' | 'meadow-blue' | 'atelier';
export type AppId = 'agentroom' | 'uniplan' | 'documents' | 'notes' | 'gamelab' | 'terminal' | 'settings';

export type AppMeta = { title: string; icon: string; accent: string; summary: string };
export type WindowState = { id: AppId; z: number; x: number; y: number; minimized?: boolean; maximized?: boolean };
export type DragState = { id: AppId; startX: number; startY: number; originX: number; originY: number };
export type GameRegistryItem = { id: string; title: string; license: string; status: string; bundlePath?: string; notes?: string };
export type LinkTarget = { label: string; url: string; description: string };
export type AgentCard = { name: string; role: string; status: string; next: string; accent: string };
export type WorkCard = { title: string; status: string; description: string; linkLabel: string; url: string };
export type AgentRoomRoom = { id: string; name: string; meta: string };
export type AgentRoomMessage = { author: string; role: string; body: string };

export type DosPlayer = { stop?: () => Promise<void>; save?: () => Promise<unknown> };
export type DosLauncher = (root: HTMLElement, options: Record<string, unknown>) => DosPlayer;
