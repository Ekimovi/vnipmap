<script setup>
import { computed } from 'vue'
import ENode from './e-node.vue'

const props = defineProps(['nodes', 'selectIndex'])
const emit = defineEmits(['clickNode', 'clickAddress'])

const sortGroup = (group) => {
  return Object.values(group).sort((aa, bb) => {
    const a = aa[0],
      b = bb[0]
    if (a.ad_street == b.ad_street) return a.ad_home - b.ad_home
    return a.ad_street > b.ad_street ? -1 : 1
  })
}
const groupedNodes = computed(() => {
  return sortGroup(
    props.nodes.reduce((prev, node) => {
      const key = node.ad_id
      key in prev ? prev[key].push(node) : (prev[key] = [node])
      return prev
    }, {})
  )
})
const nodesList = computed(() => {
  return [].concat.apply([], groupedNodes.value)
})
// const groupedNodes = computed(() => {
//   let ad_id
//   return props.nodes.reduce((prev, node) => {
//     if (node.ad_id == ad_id) prev[prev.length - 1].push(node)
//     else {
//       prev.push([node])
//       ad_id = node.ad_id
//     }
//     return prev
//   }, [])
// })
</script>

<template>
  <div v-for="group in groupedNodes" class="group bg-white shadow-2">
    <e-node
      v-for="(node, i) in group"
      :node="node"
      :address="i == 0"
      @click-node="emit('clickNode', node)"
      :key="node.s_id"
      :select="
        nodesList[selectIndex] && node.s_id == nodesList[selectIndex].s_id
      "
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
