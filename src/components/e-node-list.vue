<script setup>
import { computed } from 'vue'
import ENode from "./e-node.vue"

const props = defineProps(['nodes'])
const emit = defineEmits(['clickNode', 'clickAddress'])

const groupedNodes = computed(() => {
  return props.nodes.reduce((prev, node) => {
    const key = node.ad_id
    key in prev ? prev[key].nodes.push(node) : prev[key] = { nodes: [node] }
    return prev
  }, {})
}
)
</script>

<template>
  <q-list class="bg-white">
    <div v-for="group in groupedNodes" class="group">
      <e-node
        v-for="(node, i) in group.nodes"
        :node="node"
        :address="i == 0"
        @click-node="emit('clickNode', node)"
        :key="node.s_id"
      />
    </div>
  </q-list>
</template>

<style lang="sass" scoped>

.group
  display: flex
  flex-direction: column
  margin-top: 5px
  /* border-radius: 5px */

  & > div
    display: flex
    flex-direction: row
</style>
