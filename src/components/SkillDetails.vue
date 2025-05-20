<!-- src/components/SkillDetails.vue -->
<template>
  <div v-if="selectedSkill" class="skill-details space-y-6">
    <div class="skill-header border-b border-event-horizon pb-4">
      <h2 class="text-2xl font-rpg-heading text-plasma">
        {{ selectedSkill.name }}
      </h2>
      <div class="text-quantum mt-1">
        {{ selectedSkill.title }} ⚡ Level {{ selectedSkill.level }}
      </div>
    </div>

    <div class="xp-progress">
      <div class="flex justify-between text-sm mb-2 text-stardust">
        <span>▲ Progress to Level {{ selectedSkill.level + 1 }}</span>
        <span>{{ selectedSkill.xp }} / {{ selectedSkill.xpToNext }} XP</span>
      </div>
      <div class="h-3 bg-dark-matter rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-stardust to-quantum transition-all duration-500"
          :style="{ width: `${(selectedSkill.xp / selectedSkill.xpToNext) * 100}%` }"
        />
      </div>
    </div>

    <div class="skill-description text-event-horizon leading-relaxed">
      {{ selectedSkill.description }}
    </div>

    <div class="related-goals">
      <h3 class="font-rpg-heading mb-3 text-plasma">🔗 Linked Quests</h3>
      <ul v-if="relatedGoals.length" class="space-y-3">
        <li 
          v-for="goal in relatedGoals"
          :key="goal.id"
          class="skill-node hover:shield-bubble"
        >
          <div class="text-sm p-3">
            <div class="flex justify-between items-center">
              <span class="text-stardust">{{ goal.title }}</span>
              <span class="text-plasma">+{{ goal.reward.value }} XP</span>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="text-quantum text-sm">
        ⚠️ No cosmic connections yet
      </div>
    </div>

    <div v-if="selectedSkill.unlockedPaths.length" class="unlocked-paths">
      <h3 class="font-rpg-heading mb-3 text-plasma">🌌 Astral Pathways</h3>
      <div class="space-y-3">
        <div 
          v-for="pathId in selectedSkill.unlockedPaths"
          :key="pathId"
          class="skill-node hover:shield-bubble"
        >
          <div class="text-sm p-3 text-stardust">
            {{ getSkillName(pathId) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-state text-quantum text-center py-8">
    ✨ Select a cosmic node to begin
  </div>
</template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useLearningStore } from '../stores/skills'
  import { useGoalsStore } from '../stores/goals'
  
  const learningStore = useLearningStore()
  const goalsStore = useGoalsStore()
  
  const selectedSkill = computed(() => learningStore.selectedSkill)
  

  const relatedGoals = computed(() => 
    goalsStore.goals.filter(goal => 
      (goal.skillIds || []).includes(selectedSkill.value?.id || '')
    )
  )

  
  const getSkillName = (skillId: string) => {
    return learningStore.skills[skillId]?.name || 'Unknown Skill'
  }
  </script>

<style scoped>
.skill-node {
  @apply bg-dark-matter/30 border border-event-horizon/20 rounded-lg;
  @apply transition-all duration-300 hover:border-stardust/40 hover:shadow-hologram;
}

.shield-bubble {
  animation: shield-bubble 2s infinite;
}

@keyframes shield-bubble {
  0% { box-shadow: 0 0 10px #7af8ff; }
  50% { box-shadow: 0 0 30px #7af8ff; }
  100% { box-shadow: 0 0 10px #7af8ff; }
}
</style>