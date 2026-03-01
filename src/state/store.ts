import { create } from 'zustand';
import type { SneezeEvent } from './types';

interface SneezeState {
  events: SneezeEvent[];
  addEvent: (event: Omit<SneezeEvent, 'id'>) => void;
  clearEvents: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useSneezeStore = create<SneezeState>((set) => ({
  events: [],

  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, id: generateId() },
      ].sort((a, b) => b.timestamp - a.timestamp),
    })),

  clearEvents: () => set({ events: [] }),
}));
