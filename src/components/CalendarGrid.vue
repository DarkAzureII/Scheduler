<template>
    <div class="p-8">
      <h2 className="text-3xl mb-6 font-thin">{{ currentMonth }}</h2>
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="day in daysInMonth" 
          :key="day"
          class="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer text-center"
          @click="selectDay(day)"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  const currentDate = ref(new Date());
  
  const currentMonth = computed(() => {
    return currentDate.value.toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  });
  
  const daysInMonth = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    return new Date(year, month + 1, 0).getDate();
  });
  
  const selectDay = (day: number) => {
    console.log('Selected day:', day);
  };
  </script>