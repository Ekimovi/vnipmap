<script setup>
import { computed } from 'vue'
import ENode from './e-node.vue'

const props = defineProps(['nodes'])
const emit = defineEmits(['clickNode', 'clickAddress'])

const groupedNodes = computed(() => {
  return props.nodes.reduce((prev, node) => {
    const key = node.ad_id
    key in prev ? prev[key].nodes.push(node) : (prev[key] = { nodes: [node] })
    return prev
  }, {})
})
</script>

<template>
  <div v-for="group in groupedNodes" class="group bg-white shadow-2">
    <e-node
      v-for="(node, i) in group.nodes"
      :node="node"
      :address="i == 0"
      @click-node="emit('clickNode', node)"
      :key="node.s_id"
    />
  </div>
</template>

<style lang="sass">

.group
  display: flex
  flex-direction: column
  margin-top: 5px
  // background-color: rgba(255, 255, 255, 0.8)
  border-radius: 0.3em
</style>
