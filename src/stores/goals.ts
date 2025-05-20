// src/stores/goals.ts
import { defineStore } from 'pinia';
import { useStatsStore } from './stats';
import { useLearningStore } from './skills';
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
  skillIds: string[]; // Changed to array and plural name
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

// In addGoal action:
async addGoal(goalData: Omit<Goal, "id" | "isComplete" | "createdAt" | "updatedAt">) {
  console.log('[DEBUG] Starting addGoal with:', goalData)
  
  const learningStore = useLearningStore()
  const newGoal: Goal = {
    ...goalData,
    id: crypto.randomUUID(),
    isComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: goalData.tags || [],
    skillIds: []
  }

  console.log('[DEBUG] Initial newGoal:', newGoal)
  
  try {
    if (goalData.skillIds?.length) {
      console.log('[DEBUG] Processing skillIds:', goalData.skillIds)
      
      for (const skillId of goalData.skillIds) {
        console.log('[DEBUG] Processing skillId:', skillId)
        const skill = learningStore.skills[skillId]
        console.log('[DEBUG] Found skill:', skill)
        
        if (skill) {
          console.log('[DEBUG] Adding skill to goal:', skillId)
          newGoal.skillIds.push(skillId)
          
          // Add this temporary check
          if (newGoal.skillIds.length > 100) {
            throw new Error('Skill ID overflow protection')
          }
        }
      }
    }
    
    console.log('[DEBUG] Final newGoal before push:', newGoal)
    this.goals.push(newGoal)
    this.save()
    
    console.log('[DEBUG] Goal added successfully')
    return newGoal
  } catch (error) {
    console.error('Error in addGoal:', error)
    throw error
  }
},

    async toggleComplete(id: string) {
      const goal = this.goals.find(g => g.id === id);
      if (!goal) return;

      const wasComplete = goal.isComplete;
      goal.isComplete = !goal.isComplete;
      goal.updatedAt = new Date().toISOString();
      
      const statsStore = useStatsStore();
      const learningStore = useLearningStore();
      
      await statsStore.load();

      if (goal.reward.type === 'xp') {
        const xpAmount = goal.reward.value * (wasComplete ? -1 : 1);
        
        // Update stats
        if (goal.reward.stat) {
          wasComplete 
            ? statsStore.loseXP(goal.reward.stat, goal.reward.value, `Goal Undo: ${goal.title}`)
            : statsStore.gainXP(goal.reward.stat, goal.reward.value, `Goal: ${goal.title}`);
        }

        // Update skills
        if (goal.skillIds.length > 0) {
          goal.skillIds.forEach(skillId => {
            wasComplete
              ? learningStore.loseXp(skillId, goal.reward.value)
              : learningStore.gainXp(skillId, goal.reward.value);
          });
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