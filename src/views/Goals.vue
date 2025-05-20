<!-- src/components/GoalsPage.vue -->
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useGoalsStore, type Goal, type GoalReward } from '../stores/goals';
import { useStatsStore, type StatName } from '../stores/stats';
import { useLearningStore } from '../stores/skills';
import { ChevronDownIcon, PlusIcon, TrophyIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  components: { ChevronDownIcon, PlusIcon, TrophyIcon },
  setup() {
    const goalsStore = useGoalsStore();
    const statsStore = useStatsStore();
    const learningStore = useLearningStore();
    
    const showForm = ref(false);
    const filter = ref<'all' | 'active' | 'completed'>('all');
    const sortBy = ref<'deadline' | 'created'>('deadline');
    const showSkillCreation = ref(false);
    const selectedSkill = ref<string>('');
    
    const newGoal = ref({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      reward: { 
        type: 'xp' as 'xp' | 'item', // Explicit union type
        stat: 'Intelligence' as StatName, 
        value: 50 
      },
      tags: [] as string[],
      skillIds: [] as string[] 
    });

    const newSkill = ref({
      name: '',
      description: '',
      stat: 'Intelligence' as StatName
    });

    const filteredGoals = computed(() => {
      let goals = goalsStore.goals;
      
      if (filter.value === 'active') goals = goalsStore.activeGoals;
      if (filter.value === 'completed') goals = goalsStore.completedGoals;

      return sortBy.value === 'deadline' 
        ? [...goals].sort((a, b) => 
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        : [...goals].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    const deadlineStatus = (deadline: string) => {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays < 0) return 'overdue';
      if (diffDays === 0) return 'today';
      if (diffDays <= 2) return 'urgent';
      return 'normal';
    };

    const createNewSkill = async () => {
      const skillId = await learningStore.createManualSkill({
        name: newSkill.value.name,
        description: newSkill.value.description,
        stat: newSkill.value.stat
      });
      selectedSkill.value = skillId;
      showSkillCreation.value = false;
      newSkill.value = { name: '', description: '', stat: 'Intelligence' };
    };

    const handleSkillSelect = () => {
      if (selectedSkill.value === '') {
        showSkillCreation.value = true;
      }
    };

    const handleAddGoal = async () => {
      const goalData = {
        ...newGoal.value,
        skillIds: selectedSkill.value ? [selectedSkill.value] : []
      };
      
      await goalsStore.addGoal(goalData);
      showForm.value = false;
      
      // Reset form
      selectedSkill.value = '';
      newGoal.value = {
        title: '',
        description: '',
        deadline: new Date().toISOString().split('T')[0],
        reward: { type: 'xp', stat: 'Intelligence', value: 50 },
        tags: [],
        skillIds: []
      };
    };

    onMounted(() => {
      goalsStore.load();
      statsStore.load();
      learningStore.load();
    });

    return {
      goalsStore,
      statsStore,
      learningStore,
      showForm,
      newGoal,
      filteredGoals,
      filter,
      sortBy,
      deadlineStatus,
      handleAddGoal,
      showSkillCreation,
      selectedSkill,
      newSkill,
      createNewSkill,
      handleSkillSelect
    };
  }
});
</script>

<template>
  <div class="goals-page bg-void text-stardust min-h-screen p-6 crt-effect">
    <!-- Skill Creation Modal -->
    <div v-if="showSkillCreation" class="fixed inset-0 bg-void/90 flex items-center justify-center z-50">
      <div class="rpg-panel max-w-md w-full m-4">
        <h3 class="text-xl font-rpg-heading mb-4">✨ Forge New Skill</h3>
        <div class="space-y-4">
          <input v-model="newSkill.name" class="rpg-input" placeholder="Skill Name">
          <textarea v-model="newSkill.description" class="rpg-textarea" placeholder="Ancient Knowledge"></textarea>
          <select v-model="newSkill.stat" class="rpg-input">
            <option v-for="stat in statsStore.allStats" :value="stat.name">
              {{ stat.name }}
            </option>
          </select>
          <div class="flex gap-2 justify-end">
            <button @click="showSkillCreation = false" class="rpg-btn">Cancel</button>
            <button 
              @click="createNewSkill"
              class="rpg-btn bg-plasma hover:bg-plasma/80"
            >
              Enchant Skill
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-rpg-heading flex items-center gap-2 glowing-text">
          <TrophyIcon class="w-8 h-8 text-plasma drop-shadow-plasma-glow" />
          🗡️ Quest Chronicle
        </h1>
        <button
          @click="showForm = !showForm"
          class="rpg-btn flex items-center gap-2 hover:shadow-hologram-md"
        >
          <PlusIcon class="w-5 h-5 text-stardust" />
          Forge New Quest
        </button>
      </div>

      <!-- New Goal Form -->
      <div v-if="showForm" class="mb-8 rpg-panel">
        <h2 class="text-xl font-rpg-heading mb-4">🛠️ Craft Quest</h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-2 text-quantum">Quest Title</label>
            <input
              v-model="newGoal.title"
              class="rpg-input"
              placeholder="Defeat the Vue Dragon"
            />
          </div>
          
          <div>
            <label class="block mb-2 text-quantum">Ancient Scrolls</label>
            <textarea
              v-model="newGoal.description"
              class="rpg-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-quantum">Moon Cycle</label>
              <input
                type="date"
                v-model="newGoal.deadline"
                class="rpg-input"
              />
            </div>
            
            <div>
              <label class="block mb-2 text-quantum">Arcane Bounty</label>
              <div class="flex gap-2">
                <select
                  v-model="newGoal.reward.stat"
                  class="rpg-input flex-1"
                >
                  <option v-for="stat in statsStore.allStats" :value="stat.name">
                    {{ stat.name }} XP
                  </option>
                </select>
                <input
                  type="number"
                  v-model="newGoal.reward.value"
                  class="rpg-input w-20"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label class="block mb-2 text-quantum">Skill Path</label>
              <div class="flex gap-2">
                <select
                  v-model="selectedSkill"
                  class="rpg-input flex-1"
                  @change="handleSkillSelect"
                >
                  <option value="">-- Create New Skill --</option>
                  <option 
                    v-for="skill in learningStore.skillsList"
                    :value="skill.id"
                  >
                    {{ skill.name }} ({{ skill.title }})
                  </option>
                </select>
                <button
                  v-if="!selectedSkill"
                  @click="showSkillCreation = true"
                  class="rpg-btn-sm bg-plasma/20 hover:bg-plasma/30"
                >
                  🧙♂️ Craft Skill
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button
              @click="showForm = false"
              class="rpg-btn bg-singularity hover:bg-dark-matter"
            >
              Abandon
            </button>
            <button
              @click="handleAddGoal"
              class="rpg-btn bg-quantum hover:bg-plasma"
            >
              Enchant Quest
            </button>
          </div>
        </div>
      </div>

      <!-- Goals List -->
      <div class="space-y-4">
        <div
          v-for="goal in filteredGoals"
          :key="goal.id"
          class="skill-node transition-transform duration-300 hover:scale-[1.01]"
          :class="{
            'border-2 border-plasma/30 bg-plasma/10': goal.isComplete,
            'border-2 border-red-500/30 animate-pulse': deadlineStatus(goal.deadline) === 'overdue' && !goal.isComplete,
            'border-2 border-amber-400/30 shadow-amber-glow': deadlineStatus(goal.deadline) === 'today' && !goal.isComplete,
            'border-2 border-orange-400/30 shadow-orange-glow': deadlineStatus(goal.deadline) === 'urgent' && !goal.isComplete,
            'border-2 border-event-horizon/30': deadlineStatus(goal.deadline) === 'normal' && !goal.isComplete
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="relative">
                  <input
                    type="checkbox"
                    :checked="goal.isComplete"
                    @change="goalsStore.toggleComplete(goal.id)"
                    class="rpg-checkbox"
                  />
                  <div class="rpg-checkbox-overlay"></div>
                </div>
                <h3 class="text-lg font-rpg-heading text-stardust">{{ goal.title }}</h3>
                <button
                  v-if="!goal.isComplete"
                  @click="goalsStore.toggleComplete(goal.id)"
                  class="ml-2 px-3 py-1 text-sm rpg-btn-sm bg-green-600 hover:bg-green-500"
                >
                  🏆 Complete (+{{ goal.reward.value }} XP)
                </button>
                <button
                  v-else
                  @click="goalsStore.toggleComplete(goal.id)"
                  class="ml-2 px-3 py-1 text-sm rpg-btn-sm bg-red-600 hover:bg-red-500"
                >
                  ⏳ Undo (-{{ goal.reward.value }} XP)
                </button>
                <span
                  v-if="goal.reward.type === 'xp'"
                  class="px-2 py-1 text-sm rounded-full bg-quantum/20 text-plasma"
                >
                  ✨ +{{ goal.reward.value }} {{ goal.reward.stat }} XP
                  <span 
                    v-for="skillId in goal.skillIds"
                    :key="skillId"
                    class="ml-2 text-xs skill-discovery"
                  >
                    {{ learningStore.skills[skillId]?.name }}
                    (Lv. {{ learningStore.skills[skillId]?.level }})
                  </span>
                </span>
              </div>
              
              <div v-if="goal.description" class="text-event-horizon mb-2">
                {{ goal.description }}
              </div>
              
              <div class="flex items-center gap-4 text-sm text-quantum">
                <span v-for="skillId in goal.skillIds" :key="skillId" class="flex items-center gap-1">
                  <span class="text-plasma">⚡</span>
                  {{ learningStore.skills[skillId]?.name || 'New Skill Path' }}
                </span>
                <span>🌕 {{ new Date(goal.deadline).toLocaleDateString() }}</span>
                <span>📅 {{ new Date(goal.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <style scoped>
  .rpg-panel {
    @apply bg-dark-matter/50 border border-event-horizon/30 rounded-xl p-6;
    @apply shadow-hologram transition-all duration-300;
  }
  
  .skill-node {
    @apply p-4 rounded-xl bg-gradient-to-br from-dark-matter/30 to-void/50;
    @apply transition-all duration-300 hover:shadow-hologram;
  }
  
  .rpg-checkbox {
    @apply w-5 h-5 appearance-none bg-dark-matter border border-event-horizon rounded;
    @apply checked:bg-quantum checked:border-plasma;
  }
  
  .rpg-checkbox-overlay {
    @apply absolute inset-0 pointer-events-none flex items-center justify-center;
    @apply text-stardust opacity-0 checked:opacity-100;
  }
  
  .glowing-text {
    text-shadow: 0 0 15px rgba(122, 248, 255, 0.4);
  }
  
  .shadow-amber-glow {
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
  }
  
  .shadow-orange-glow {
    box-shadow: 0 0 15px rgba(251, 146, 60, 0.3);
  }
  
  .rpg-btn-sm {
    @apply px-3 py-1 rounded-lg text-xs border border-event-horizon;
    @apply transition-all duration-300 hover:translate-y-[-1px];
  }
  
  .rpg-input {
    @apply bg-dark-matter/50 border border-event-horizon rounded-lg px-4 py-2 text-stardust;
    @apply placeholder-quantum/70 focus:ring-2 focus:ring-stardust focus:border-stardust;
  }
  
  .rpg-textarea {
    @apply rpg-input h-32 resize-none;
  }


.skill-discovery {
  animation: skillDiscovery 0.8s ease-out;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}

@keyframes skillDiscovery {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

  </style>