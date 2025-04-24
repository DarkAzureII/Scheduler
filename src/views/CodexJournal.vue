<template>
    <div class="flex flex-col h-full crt-effect">
      <!-- Header -->
      <header class="bg-singularity/70 text-stardust p-4 flex items-center justify-between border-b border-event-horizon">
        <h1 class="text-2xl font-rpg-heading animate-pulse-glow">📜 Codex Journal</h1>
        <button 
          @click="showQuickAdd = true" 
          class="rpg-btn"
        >
          ✨ New Memory Crystal
        </button>
      </header>
  
      <!-- Quick Add Modal -->
      <div v-if="showQuickAdd" class="fixed inset-0 bg-void/90 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-dark-matter p-6 rounded-xl w-11/12 max-w-md border border-event-horizon hologram-lg">
          <h2 class="font-rpg-heading text-plasma mb-4">🔍 Add New Memory Crystal</h2>
          <input 
            v-model="newEntry.title"
            placeholder="Title" 
            class="rpg-input mb-3"
          />
          <textarea
            v-model="newEntry.summary"
            placeholder="Summary" 
            class="rpg-textarea mb-3"
            rows="4"
          ></textarea>
          <input
            v-model="newEntry.source"
            placeholder="Source (link or note)"
            class="rpg-input mb-3"
          />
          <input
            v-model="newEntry.tagsInput"
            placeholder="Tags (comma-separated)"
            class="rpg-input mb-3"
          />
          <div class="flex justify-end space-x-2">
            <button @click="addEntry" class="rpg-btn bg-quantum hover:bg-plasma">
              🔮 Enshrine
            </button>
            <button @click="cancelAdd" class="rpg-btn bg-singularity hover:bg-event-horizon">
              ⏳ Discard
            </button>
          </div>
        </div>
      </div>
  
      <div class="flex-1 overflow-auto p-4">
        <!-- Filter / Search -->
        <div class="mb-4 flex space-x-2">
          <input 
            v-model="searchQuery" 
            placeholder="🔍 Scan Memory Crystals..." 
            class="rpg-input flex-1"
          />
          <select 
            v-model="filterTag" 
            class="rpg-input w-40"
          >
            <option value="">All Domains</option>
            <option 
              v-for="tag in allTags" 
              :key="tag" 
              :value="tag"
              class="bg-dark-matter"
            >
              {{ tag }}
            </option>
          </select>
        </div>
  
        <!-- Entries List -->
        <div class="space-y-4">
          <div 
            v-for="entry in filteredEntries" 
            :key="entry.id" 
            class="skill-node hover:shield-bubble"
          >
            <h3 class="font-rpg-heading text-stardust mb-2">{{ entry.title }}</h3>
            <p class="text-quantum/90 mb-2">{{ entry.summary }}</p>
            <p class="text-xs text-event-horizon mb-2">
              Source: 
              <a 
                :href="entry.source" 
                target="_blank" 
                class="text-plasma hover:text-stardust"
              >
                {{ entry.source || 'Ancient Text' }}
              </a>
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in entry.tags" 
                :key="tag" 
                class="rpg-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted, watch } from 'vue';
  import { useCodexStore, type Entry } from '../stores/codex';
  
  export default defineComponent({
    name: 'CodexJournalPage',
    setup() {
      const codex = useCodexStore();
      const showQuickAdd = ref(false);
      const newEntry = ref({
        title: '',
        summary: '',
        source: '',
        tagsInput: ''
      });
  
      const searchQuery = ref('');
      const filterTag = ref('');
  
      const allTags = computed(() => codex.getAllTags);
      
      const filteredEntries = computed(() => {
        return codex.entries.filter(e => {
          const search = searchQuery.value.toLowerCase();
          const matchesSearch = e.title.toLowerCase().includes(search) ||
                              e.summary.toLowerCase().includes(search) ||
                              e.tags.some(t => t.toLowerCase().includes(search));
          const matchesTag = filterTag.value ? e.tags.includes(filterTag.value) : true;
          return matchesSearch && matchesTag;
        });
      });
  
      function addEntry() {
        const tags = newEntry.value.tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t);
        
        if (newEntry.value.title) {
            codex.addEntry({
            title: newEntry.value.title,
            summary: newEntry.value.summary,
            source: newEntry.value.source,
            tags
            });
          cancelAdd();
        }
      }
  
      function cancelAdd() {
        newEntry.value = { title: '', summary: '', source: '', tagsInput: '' };
        showQuickAdd.value = false;
      }
  
      onMounted(() => {
        if (codex.entries.length === 0) {
          codex.load();
        }
      });
  
      watch(searchQuery, (newVal) => {
        if (newVal.length > 2) {
          // Add search feedback animation
        }
      });
  
      return {
        showQuickAdd,
        newEntry,
        addEntry,
        cancelAdd,
        searchQuery,
        filterTag,
        allTags,
        filteredEntries
      };
    }
  });
  </script>
  
  <style scoped>
  .skill-node {
    @apply p-4 rounded-xl border border-event-horizon/30 bg-gradient-to-br from-dark-matter/30 to-void/50;
    transition: all 0.3s ease;
  }
  
  .skill-node:hover {
    @apply border-stardust/40 transform scale-[1.01] shadow-hologram;
  }
  
  .rpg-input {
    @apply bg-dark-matter/50 border border-event-horizon rounded-lg px-4 py-2 text-stardust placeholder-quantum/70;
  }
  
  .rpg-input:focus {
    @apply border-stardust ring-1 ring-stardust/30;
  }
  
  .rpg-btn {
    @apply px-4 py-2 rounded-lg font-rpg-heading transition-all duration-300 border;
  }
  
  .rpg-tag {
    @apply px-2 py-1 text-xs rounded-full bg-singularity border border-event-horizon text-stardust/90;
  }
  
  header {
    @apply sticky top-0 z-40;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-singularity hover:bg-event-horizon;
  }
  </style>