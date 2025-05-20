<!-- src/components/SkillsPage.vue -->
<template>
  <div class="skills-page bg-void text-stardust min-h-screen p-6 crt-effect">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-rpg-heading flex items-center gap-2 glowing-text">
          <span class="text-plasma">🔮</span>
          Cosmic Skill Tree
        </h1>
        <p class="text-quantum mt-2">
          Forge your path through the astral plane of knowledge
        </p>
      </div>

      <div class="skills-container grid grid-cols-3 gap-8">
        <!-- Skill Tree Visualization -->
        <div class="col-span-2 rpg-panel h-[600px]">
          <SkillTree />
        </div>

        <!-- Selected Skill Details -->
        <div class="rpg-panel">
          <SkillDetails />
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { useLearningStore } from '../stores/skills'
  import { useGoalsStore } from '../stores/goals'
  import SkillTree from '../components/SkillTree.vue'
  import SkillDetails from '../components/SkillDetails.vue'
  import { onMounted } from 'vue'
  
  const learningStore = useLearningStore()
  const goalsStore = useGoalsStore()

  onMounted(() => {
      learningStore.load();
      goalsStore.load();
    });
  </script>

<style scoped>
.rpg-panel {
  @apply bg-dark-matter/50 border border-event-horizon/30 rounded-xl backdrop-blur-sm;
  @apply shadow-hologram transition-all duration-300 hover:border-stardust/40;
}

.glowing-text {
  text-shadow: 0 0 15px rgba(122, 248, 255, 0.4);
}
</style>