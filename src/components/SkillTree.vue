<!-- src/components/SkillTree.vue -->
<template>
  <div ref="network" class="h-full w-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import { useLearningStore } from '../stores/skills'

const network = ref<HTMLElement | null>(null)
const learningStore = useLearningStore()
let networkInstance: Network | null = null

// Create datasets outside of init
const nodes = new DataSet<any>([])
const edges = new DataSet<any>([])

onMounted(() => {
  initNetwork()
})

const updateNetworkData = () => {
  nodes.clear()
  nodes.add(learningStore.skillsList.map(skill => ({
    id: skill.id,
    label: `${skill.name}\nLv. ${skill.level}`,
    title: `
      Level ${skill.level} ${skill.title}\n
      XP: ${skill.xp}/${skill.xpToNext}\n
      ${skill.description}
    `,
    group: Math.min(skill.level, 10),
    borderWidth: skill.level > 0 ? 3 : 1,
    value: skill.level + 1
  })))

  edges.clear()
  edges.add(learningStore.skillsList.flatMap(skill => 
    skill.unlockedPaths.map(path => ({
      from: skill.id,
      to: path,
      arrows: 'to'
    }))
  ))
}

const initNetwork = () => {
  if (!network.value) return

  updateNetworkData()

  const options = {
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -5000, // More spaced-out feel
        springLength: 300,
        springConstant: 0.02
      }
    },
    nodes: {
      shape: 'dot',
      font: {
        size: 16,
        face: 'Space Mono',
        color: '#7af8ff',
        multi: 'html'
      },
      borderWidth: 2,
      borderColor: '#31639e',
      color: {
        background: '#2a4b8d',
        border: '#7af8ff',
        highlight: {
          background: '#4a2f8d',
          border: '#ff4d7a'
        }
      },
      shadow: {
        enabled: true,
        color: 'rgba(122, 248, 255, 0.2)',
        size: 15
      }
    },
    edges: {
      color: '#31639e',
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.5
      },
      width: 1.5,
      hoverWidth: 3
    },
    interaction: {
      hover: true
    }
  }

  networkInstance = new Network(network.value, { nodes, edges }, options)
  networkInstance.on('click', params => {
      if (params.nodes.length) {
      learningStore.selectSkill(params.nodes[0])
    } else {
      learningStore.selectSkill(null) // Ensure null is passed explicitly
    }
  })
}

watch(
  () => learningStore.skillsList,
  () => {
    updateNetworkData()
    networkInstance?.redraw()
  },
  { deep: true }
)
</script>