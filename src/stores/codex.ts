// src/stores/codex.ts
import { defineStore } from 'pinia';

export type Entry = {
  id: string;
  title: string;
  summary: string;
  source: string;
  tags: string[];
  createdAt: string;
};

interface CodexState {
  entries: Entry[];
}

export const useCodexStore = defineStore('codex', {
  state: (): CodexState => ({
    entries: [],
  }),

  getters: {
    getAllTags: (state): string[] => {
      const tagSet = new Set<string>();
      state.entries.forEach(entry => {
        entry.tags.forEach(tag => tagSet.add(tag));
      });
      return Array.from(tagSet);
    },
  },

  actions: {
    load() {
      const saved = localStorage.getItem('codex-entries');
      if (saved) {
        this.entries = JSON.parse(saved);
      }
    },

    save() {
      localStorage.setItem('codex-entries', JSON.stringify(this.entries));
    },

    addEntry(entry: Omit<Entry, 'id' | 'createdAt'>) {
      const newEntry: Entry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...entry,
      };
      this.entries.unshift(newEntry);
      this.save();
    },

    updateEntry(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>) {
      const index = this.entries.findIndex(e => e.id === id);
      if (index !== -1) {
        this.entries[index] = { ...this.entries[index], ...updates };
        this.save();
      }
    },

    removeEntry(id: string) {
      this.entries = this.entries.filter(e => e.id !== id);
      this.save();
    },
  },
});
