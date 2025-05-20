// stores/learning.ts
import { defineStore } from 'pinia'
import type { StatName } from './stats'

interface Skill {
  id: string
  name: string
  level: number
  xp: number
  xpToNext: number
  xpCurveBase: number
  difficulty: number
  description: string
  statAffected: StatName
  title: string
  unlockedPaths: string[]
  relatedGoalIds: string[]
}

interface State {
  skills: Record<string, Skill>
  discoveredSkillIds: string[]
  selectedSkillId: string | null
  xpCurveBase: number
  levelTitles: string[]
}

export const useLearningStore = defineStore('learning', {
  state: (): State => ({
    skills: {},
    discoveredSkillIds: [],
    selectedSkillId: null,
    xpCurveBase: 100,
    levelTitles: [
      'Beginner', 'Apprentice', 'Journeyman', 'Adept', 'Expert',
      'Specialist', 'Master', 'High Master', 'Sage', 'Grandmaster'
    ]
  }),

  getters: {
    selectedSkill: (state): Skill | null => 
      state.selectedSkillId ? state.skills[state.selectedSkillId] : null,
    skillsList: (state): Skill[] => 
      Object.values(state.skills).filter(s => state.discoveredSkillIds.includes(s.id))
  },

  actions: {
    createManualSkill(params: {
      name: string
      description: string
      difficulty?: number
      stat: StatName
    }) {
      const skillId = crypto.randomUUID()
      this.addSkill({
        id: skillId,
        name: params.name,
        description: params.description,
        statAffected: params.stat,
        difficulty: params.difficulty || 1
      })
      this.discoverSkill(skillId)
      return skillId
    },

    selectSkill(id: string | null) {
      this.selectedSkillId = id
    },

    load() {
      const saved = localStorage.getItem('codex-skills-v2')
      if (saved) {
        const data = JSON.parse(saved)
        this.skills = data.skills || {}
        this.discoveredSkillIds = data.discoveredSkillIds || []
        this.xpCurveBase = data.xpCurveBase || 100
      }
    },

    save() {
      localStorage.setItem('codex-skills-v2', JSON.stringify({
        skills: this.skills,
        discoveredSkillIds: this.discoveredSkillIds,
        xpCurveBase: this.xpCurveBase
      }))
    },

    addSkill(params: {
      id: string
      name: string
      description: string
      statAffected: StatName
      difficulty?: number
      unlockedPaths?: string[]
      relatedGoalIds?: string[]
    }) {
      if (!this.skills[params.id]) {
        const base = this.xpCurveBase * (params.difficulty || 1)
        this.skills[params.id] = {
          ...params,
          level: 0,
          xp: 0,
          xpToNext: this.getXpForLevel(1, base),
          xpCurveBase: base,
          difficulty: params.difficulty || 1,
          title: this.levelTitles[0],
          unlockedPaths: params.unlockedPaths || [],
          relatedGoalIds: params.relatedGoalIds || []
        }
        this.discoverSkill(params.id)
        this.save()
      }
    },

    discoverSkill(skillId: string) {
      if (!this.discoveredSkillIds.includes(skillId)) {
        this.discoveredSkillIds.push(skillId)
        this.save()
      }
    },

    gainXp(skillId: string, amount: number) {
      const skill = this.skills[skillId]
      if (!skill) return

      skill.xp += amount

      while (skill.xp >= skill.xpToNext && skill.level < 10) {
        skill.level++
        skill.title = this.levelTitles[skill.level - 1] || '???'
        skill.xp -= skill.xpToNext
        skill.xpToNext = this.getXpForLevel(skill.level + 1, skill.xpCurveBase)
        this.checkForUnlocks(skillId)
      }
      this.save()
    },

    checkForUnlocks(skillId: string) {
      const skill = this.skills[skillId]
      if (!skill) return

      // Basic unlock logic - can be expanded later
      if ([3, 5, 8].includes(skill.level)) {
        skill.unlockedPaths.push(`Path unlocked at level ${skill.level}`)
      }
    },

    loseXp(skillId: string, amount: number) {
      const skill = this.skills[skillId]
      if (!skill) return
    
      skill.xp = Math.max(0, skill.xp - amount)
      
      let level = 0
      let xpRequired = this.getXpForLevel(1, skill.xpCurveBase)
      
      while (xpRequired <= skill.xp && level < 10) {
        skill.xp -= xpRequired
        level++
        xpRequired = this.getXpForLevel(level + 1, skill.xpCurveBase)
      }
      
      skill.level = level
      skill.title = this.levelTitles[level - 1] || '???'
      skill.xpToNext = xpRequired
      this.save()
    },

    getXpForLevel(level: number, base: number): number {
      return Math.floor(base * Math.pow(level, 1.5))
    }
  }
})