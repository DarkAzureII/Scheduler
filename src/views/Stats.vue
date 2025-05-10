<!-- src/components/StatsDashboard.vue -->
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useStatsStore, type StatName } from '../stores/stats';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';
import { ArrowPathIcon, TrophyIcon, SparklesIcon } from '@heroicons/vue/24/outline';

ChartJS.register(...registerables);

export default defineComponent({
  components: { Radar, ArrowPathIcon, TrophyIcon, SparklesIcon },
  setup() {
    const statsStore = useStatsStore();
    const chartRef = ref<InstanceType<typeof Radar>>();
    const activeStat = ref<StatName | null>(null);
    const showRadar = ref(true);

    const levelData = (xp: number) => {
      const level = Math.floor(xp / 100) + 1;
      const currentXP = xp % 100;
      return { level, currentXP, percentage: (currentXP / 100) * 100 };
    };

    onMounted(() => {
      statsStore.load();
    });

    return {
      statsStore,
      chartRef,
      activeStat,
      showRadar,
      levelData
    };
  },
  computed: {
    chartData() {
      return {
        labels: Object.keys(this.statsStore.stats),
        datasets: [{
          label: 'Stat Levels',
          data: Object.values(this.statsStore.stats).map(stat => this.levelData(stat.xp).level),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
        }]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
              color: '#94a3b8'
            },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            pointLabels: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      };
    }
  }
});
</script>

<template>
  <div class="stats-dashboard bg-void text-stardust min-h-screen p-6 crt-effect">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-rpg-heading flex items-center gap-2 glowing-text">
          <TrophyIcon class="w-8 h-8 text-plasma drop-shadow-plasma-glow" />
          ⚔️ Character Sheet
        </h1>
        <button 
          @click="showRadar = !showRadar"
          class="rpg-btn flex items-center gap-2 hover:shadow-hologram-md"
        >
          <ArrowPathIcon class="w-5 h-5 text-stardust" />
          {{ showRadar ? 'Switch to Bars' : 'Switch to Radar' }}
        </button>
      </div>

      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <!-- Radar Chart Container -->
        <div class="rpg-panel h-96">
          <Radar 
            v-if="showRadar"
            ref="chartRef"
            :chart-data="chartData"
            :chart-options="chartOptions"
          />
          <div v-else class="grid grid-cols-2 gap-4 p-4">
            <div 
              v-for="stat in statsStore.allStats"
              :key="stat.name"
              class="skill-node hover:shield-bubble"
            >
              <h3 class="font-rpg-heading mb-2 text-nebula">{{ stat.name }}</h3>
              <div class="w-full bg-dark-matter rounded-full h-3">
                <div 
                  :style="{ width: `${levelData(stat.xp).percentage}%` }"
                  class="h-3 rounded-full bg-gradient-to-r from-stardust to-quantum"
                ></div>
              </div>
              <p class="text-xs mt-2 text-event-horizon">
                ★ Level {{ levelData(stat.xp).level }} 
                ({{ levelData(stat.xp).currentXP }}/100 XP)
              </p>
            </div>
          </div>
        </div>

        <!-- Stat Breakdown -->
        <div class="rpg-panel">
          <h2 class="text-xl font-rpg-heading mb-4 flex items-center gap-2">
            <SparklesIcon class="w-6 h-6 text-stardust animate-pulse-glow" />
            🔮 Stat Matrix
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="stat in statsStore.allStats"
              :key="stat.name"
              class="skill-node hover:shield-bubble group"
              @mouseenter="activeStat = stat.name"
              @mouseleave="activeStat = null"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-rpg-heading text-quantum">{{ stat.name }}</h3>
                <span class="text-plasma">Lv. {{ levelData(stat.xp).level }}</span>
              </div>
              <div class="w-full bg-dark-matter rounded-full h-2">
                <div 
                  :style="{ width: `${levelData(stat.xp).percentage}%` }"
                  class="h-2 rounded-full bg-gradient-to-r from-stardust to-quantum transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dev Controls -->
      <div class="rpg-panel mt-8">
        <h3 class="text-lg font-rpg-heading mb-4">⚙️ Arcane Controls</h3>
        <div class="grid grid-cols-3 gap-4">
          <div 
            v-for="stat in statsStore.allStats"
            :key="stat.name"
            class="skill-node"
          >
            <h4 class="font-rpg-heading mb-2 text-stardust">{{ stat.name }}</h4>
            <div class="flex gap-2">
              <button
                @click="statsStore.gainXP(stat.name, 25)"
                class="rpg-btn-sm bg-quantum hover:bg-plasma"
              >
                +25 XP
              </button>
              <button
                @click="statsStore.gainXP(stat.name, 50)"
                class="rpg-btn-sm bg-nebula hover:bg-event-horizon"
              >
                +50 XP
              </button>
              <button
                @click="statsStore.resetStats()"
                class="rpg-btn-sm bg-singularity hover:bg-dark-matter"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-dashboard {
  background: radial-gradient(ellipse at center, #0a1025 0%, #000817 100%);
}

.rpg-panel {
  @apply bg-dark-matter/50 border border-event-horizon/30 rounded-xl backdrop-blur-sm;
  @apply shadow-hologram transition-all duration-300 hover:border-stardust/40;
}

.skill-node {
  @apply p-4 rounded-lg border border-event-horizon/20 bg-gradient-to-br from-dark-matter/30 to-void/50;
  @apply transition-all duration-300 hover:shadow-hologram;
}

.rpg-btn {
  @apply px-6 py-2 rounded-xl font-rpg-heading border border-event-horizon;
  @apply bg-gradient-to-br from-singularity to-event-horizon hover:translate-y-[-2px];
  @apply transition-all duration-300 text-stardust;
}

.rpg-btn-sm {
  @apply px-3 py-1 rounded-lg text-xs font-rpg-body border border-event-horizon;
  @apply transition-all duration-300 hover:translate-y-[-1px];
}

.glowing-text {
  text-shadow: 0 0 15px rgba(122, 248, 255, 0.4);
}

.drop-shadow-plasma-glow {
  filter: drop-shadow(0 0 4px #ff4d7a88);
}

.progress-glow {
  box-shadow: 0 0 10px rgba(122, 248, 255, 0.3);
}

@keyframes shield-bubble {
  0% { box-shadow: 0 0 10px #7af8ff; }
  50% { box-shadow: 0 0 30px #7af8ff; }
  100% { box-shadow: 0 0 10px #7af8ff; }
}

.shield-bubble {
  animation: shield-bubble 2s infinite;
}
</style>