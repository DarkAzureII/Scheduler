great adjust this components now there's something obviosly wrong here:
<template>
    <div class="flex flex-col h-full">
      <!-- Header -->
      <header class="bg-opacity-50 bg-gray-900 text-white p-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Codex Journal</h1>
        <button @click="showQuickAdd = true" class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">+ New Tome</button>
      </header>
  
      <!-- Quick Add Modal -->
      <div v-if="showQuickAdd" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-gray-800 text-white p-6 rounded-2xl w-11/12 max-w-md">
          <h2 class="text-xl mb-4">Add New Tome</h2>
          <input v-model="newEntry.title" placeholder="Title" class="w-full mb-3 p-2 rounded bg-gray-700" />
          <textarea v-model="newEntry.summary" placeholder="Summary" class="w-full mb-3 p-2 rounded bg-gray-700" rows="4" />
          <input v-model="newEntry.source" placeholder="Source (link or note)" class="w-full mb-3 p-2 rounded bg-gray-700" />
          <input v-model="newEntry.tagsInput" placeholder="Tags (comma-separated)" class="w-full mb-3 p-2 rounded bg-gray-700" />
          <div class="flex justify-end space-x-2">
            <button @click="addEntry" class="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Save</button>
            <button @click="cancelAdd" class="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Cancel</button>
          </div>
        </div>
      </div>
  
      <div class="flex-1 overflow-auto p-4">
        <!-- Filter / Search -->
        <div class="mb-4 flex space-x-2">
          <input v-model="searchQuery" placeholder="Scan Memory Crystal..." class="flex-1 p-2 rounded bg-gray-700 text-white" />
          <select v-model="filterTag" class="p-2 rounded bg-gray-700 text-white">
            <option value="">All Domains</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>
  
        <!-- Entries List -->
        <div class="space-y-4">
          <div v-for="entry in filteredEntries" :key="entry.id" class="bg-gray-800 p-4 rounded-xl">
            <h3 class="text-lg font-semibold">{{ entry.title }}</h3>
            <p class="text-sm mb-2">{{ entry.summary }}</p>
            <p class="text-xs text-gray-400 mb-2">Source: <a :href="entry.source" target="_blank" class="underline">{{ entry.source }}</a></p>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in entry.tags" :key="tag" class="px-2 py-1 bg-blue-600 rounded-full text-xs">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useCodexStore, type Entry } from '../stores/codex';
  
  export default defineComponent({
    name: 'CodexJournalPage',
    setup() {
      const codex = useCodexStore();
      const showQuickAdd = ref(false);
      const newEntry = ref<{ title: string; summary: string; source: string; tagsInput: string }>({
        title: '', summary: '', source: '', tagsInput: ''
      });
  
      const searchQuery = ref('');
      const filterTag = ref('');
  
      const allTags = computed(() => codex.getAllTags);
      const filteredEntries = computed(() => {
        return codex.entries.filter(e => {
          const matchesSearch = e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                                e.summary.toLowerCase().includes(searchQuery.value.toLowerCase());
          const matchesTag = filterTag.value ? e.tags.includes(filterTag.value) : true;
          return matchesSearch && matchesTag;
        });
      });
  
      function addEntry() {
        const tags = newEntry.value.tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t);
        codex.addEntry({
          title: newEntry.value.title,
          summary: newEntry.value.summary,
          source: newEntry.value.source,
          tags,
        });
        cancelAdd();
      }
  
      function cancelAdd() {
        newEntry.value = { title: '', summary: '', source: '', tagsInput: '' };
        showQuickAdd.value = false;
      }
  
      onMounted(() => {
        codex.load();
      });
  
      return {
        showQuickAdd, newEntry, addEntry, cancelAdd,
        searchQuery, filterTag, allTags, filteredEntries
      };
    }
  });
  </script>  
  
  <style scoped>
  /* Base Container */
  .flex-col {
    background: rgba(0, 8, 23, 0.95);
  }
  
  /* Header */
  header {
    background: rgba(16, 24, 64, 0.7) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(100, 150, 255, 0.2);
  }
  
  h1 {
    font-family: 'Space Mono', monospace;
    text-shadow: 0 0 15px rgba(122, 248, 255, 0.4);
    color: #7af8ff;
  }
  
  /* Buttons */
  button {
    transition: all 0.3s ease;
    font-family: 'Space Mono', monospace;
  }
  
  button:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 0 5px rgba(100, 150, 255, 0.5));
  }
  
  .bg-blue-600 {
    background: linear-gradient(45deg, #183055, #2a4b8d);
    border: 1px solid #31639e;
  }
  
  /* Modal */
  .bg-gray-800 {
    background: rgba(0, 8, 23, 0.95);
    border: 1px solid rgba(100, 150, 255, 0.3);
    box-shadow: 0 0 30px rgba(100, 150, 255, 0.2);
    backdrop-filter: blur(15px);
  }
  
  /* Inputs */
  input, textarea, select {
    background: rgba(16, 24, 64, 0.5) !important;
    border: 1px solid #31639e !important;
    color: #aaf !important;
    transition: all 0.3s ease;
  }
  
  input::placeholder, textarea::placeholder {
    color: #88a !important;
  }
  
  input:focus, textarea:focus {
    border-color: #7af8ff !important;
    box-shadow: 0 0 15px rgba(122, 248, 255, 0.3);
  }
  
  /* Entries List */
  .bg-gray-800 {
    background: rgba(16, 24, 64, 0.3) !important;
    border: 1px solid rgba(100, 150, 255, 0.2);
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
  }
  
  .bg-gray-800:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 25px rgba(100, 150, 255, 0.2);
  }
  
  /* Tags */
  .bg-blue-600 {
    background: linear-gradient(45deg, #183055, #2a4b8d);
    border: 1px solid #31639e;
    font-size: 0.8em;
  }
  
  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    background: rgba(0, 8, 23, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: #2a4b8d;
    border-radius: 4px;
  }
  
  /* Mystical Effects */
  @keyframes pulse-glow {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
  
  header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #7af8ff, transparent);
    opacity: 0.3;
    animation: pulse-glow 3s infinite;
  }
  
  .modal-overlay {
    backdrop-filter: blur(5px);
  }
  </style>