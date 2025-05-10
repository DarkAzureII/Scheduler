// src/stores/goals.ts
import { defineStore } from 'pinia';
import { useStatsStore } from './stats';
import type { StatName } from './stats';

export interface GoalReward {
  type: 'xp' | 'item';
  stat?: StatName;
  value: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  reward: GoalReward;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface GoalsState {
  goals: Goal[];
}

export const useGoalsStore = defineStore('goals', {
  state: (): GoalsState => ({
    goals: []
  }),

  getters: {
    activeGoals: (state) => state.goals.filter(g => !g.isComplete),
    completedGoals: (state) => state.goals.filter(g => g.isComplete),
    sortedByDeadline: (state) => [...state.goals].sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  },

  actions: {
    load() {
      const saved = localStorage.getItem('codex-goals');
      if (saved) {
        this.goals = JSON.parse(saved);
      }
    },

    save() {
      localStorage.setItem('codex-goals', JSON.stringify(this.goals));
    },

    addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isComplete'>) {
      const newGoal: Goal = {
        ...goal,
        id: crypto.randomUUID(),
        isComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: goal.tags || []
      };
      
      this.goals.push(newGoal);
      this.save();
    },

    async toggleComplete(id: string) {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) return;
    
        const wasComplete = goal.isComplete;
        goal.isComplete = !goal.isComplete;
        goal.updatedAt = new Date().toISOString();
        
        if (goal.reward.type === 'xp') {
          const statsStore = useStatsStore();
          await statsStore.load();
          
          if (!wasComplete && goal.isComplete) {
            // Gaining XP
            statsStore.gainXP(goal.reward.stat!, goal.reward.value, `Goal: ${goal.title}`);
          } else if (wasComplete && !goal.isComplete) {
            // Losing XP
            statsStore.loseXP(goal.reward.stat!, goal.reward.value, `Goal Undo: ${goal.title}`);
          }
        }
        
        this.save();
    },

    deleteGoal(id: string) {
      this.goals = this.goals.filter(g => g.id !== id);
      this.save();
    }
  }
});