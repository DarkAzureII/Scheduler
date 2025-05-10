// src/stores/stats.ts
import { defineStore } from 'pinia';

export type StatName = 'Intelligence' | 'Strength' | 'Discipline' | 'Wisdom' | 'Charisma' | 'Resilience';

export interface Stat {
  name: StatName;
  xp: number;
  lastUpdated: string;
}

interface StatsState {
  stats: Record<StatName, Stat>;
  history: Array<{ stat: StatName; amount: number; timestamp: string; source: string }>;
}

const defaultStats: Record<StatName, Stat> = {
  Intelligence: { name: 'Intelligence', xp: 0, lastUpdated: new Date().toISOString() },
  Strength: { name: 'Strength', xp: 0, lastUpdated: new Date().toISOString() },
  Discipline: { name: 'Discipline', xp: 0, lastUpdated: new Date().toISOString() },
  Wisdom: { name: 'Wisdom', xp: 0, lastUpdated: new Date().toISOString() },
  Charisma: { name: 'Charisma', xp: 0, lastUpdated: new Date().toISOString() },
  Resilience: { name: 'Resilience', xp: 0, lastUpdated: new Date().toISOString() },
};

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => ({
    stats: { ...defaultStats },
    history: []
  }),

  getters: {
    getStatXP: (state) => (name: StatName): number => state.stats[name]?.xp ?? 0,
    allStats: (state): Stat[] => Object.values(state.stats),
    getLevel: (state) => (name: StatName) => Math.floor(state.stats[name].xp / 100) + 1,
    getProgress: (state) => (name: StatName) => state.stats[name].xp % 100,
    getHistory: (state) => (name: StatName) => state.history.filter(entry => entry.stat === name),
  },

  actions: {
    load() {
      const saved = localStorage.getItem('codex-stats');
      if (saved) {
        const data = JSON.parse(saved);
        this.stats = { ...defaultStats, ...data.stats };
        this.history = data.history || [];
      }
    },

    save() {
      localStorage.setItem('codex-stats', JSON.stringify({
        stats: this.stats,
        history: this.history
      }));
    },

    gainXP(statName: StatName, amount: number, source: string = 'system') {
      if (this.stats[statName]) {
        this.stats[statName].xp += amount;
        this.stats[statName].lastUpdated = new Date().toISOString();
        this.history.push({
          stat: statName,
          amount,
          timestamp: new Date().toISOString(),
          source
        });
        this.$patch({});
        this.save();
      }
    },

    loseXP(statName: StatName, amount: number, source: string = 'system') {
      if (this.stats[statName]) {
        this.stats[statName].xp = Math.max(0, this.stats[statName].xp - amount);
        this.stats[statName].lastUpdated = new Date().toISOString();
        this.history.push({
          stat: statName,
          amount: -amount,
          timestamp: new Date().toISOString(),
          source
        });
        this.$patch({});
        this.save();
      }
    },

    resetStats() {
      this.stats = { ...defaultStats };
      this.history = [];
      this.save();
    },

    // For future time-decay implementation
    decayXP(statName: StatName, amount: number) {
      if (this.stats[statName].xp - amount >= 0) {
        this.stats[statName].xp -= amount;
        this.save();
      }
    }
  },
});