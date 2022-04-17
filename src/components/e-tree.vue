<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { show } from '../stores/show'
import { activeNodeId, graph } from '../stores/nodes'
import EWindow from './e-window.vue'

onMounted(() => {
})

const structure = computed(() => {
  console.log(graph)
  const trees = graph.value.allTrees
  if (!trees)
    return {
      uplink: undefined,
      startMu: undefined,
      allTrees: undefined,
      otherMu: [],
    }
  const nearMu = trees
    .filter(
      (t) => t.tree.length == 2 && t.tree[t.tree.length - 1].node.type
    )
    .map((t) => t.tree[t.tree.length - 1].node)
  const startMu = trees[0].tree[0].node
  const uplink = nearMu.find((n) => n.s_id == startMu.s_hub1)
  const otherMu = nearMu.filter((n) => n.s_id != startMu.s_hub1)
  // console.log(
  //   this.trees.filter(
  //     (t) => t.tree.length != 2 || !t.tree[t.tree.length - 1].node.type
  //   )
  // )
  const circlePort = (tree) => {
    // if (tree[1].node.s__ip == '10.220.6.213')
    //   return 'XGigabitEthernet0/0/77'
    const relNode = tree[1]
    if (!relNode) return null
    if (relNode.node.s_id != relNode.rel.a_id) return relNode.rel.a_port
    return relNode.rel.b_port
  }
  trees.forEach((tree) => {
    tree.circlePort = circlePort(tree.tree)
  })
  const allTrees = trees
    .filter(
      (t) => t.tree.length != 2 || !t.tree[t.tree.length - 1].node.type
    )
    .sort((a, b) => {
      const regexp = /[0-9]+$/
      const aa = a.circlePort || '999',
        bb = b.circlePort || '999'
      return Number(aa.match(regexp)) - Number(bb.match(regexp))
    })
  console.log({ uplink, startMu, allTrees, otherMu })
  return { uplink, startMu, allTrees, otherMu }
})
const close = () => { show.tree = !show.tree }
const expand = ref(false)
const buttons = computed(() => [
  {
    icon: show.treeAdd
      ? 'mdi-card-minus-outline'
      : 'mdi-card-plus',
    tooltip: show.treeAdd
      ? 'Выключить дополнительную панель'
      : 'Включить дополнительную панель',
    dark: true,
    disabled: false,
    click: () => {
      show.treeAdd = !show.treeAdd
    },
    color: 'white',
  },
  {
    icon: 'mdi-share-variant',
    tooltip: 'Скопировать ссылку на активный объект',
    dark: true,
    disabled: false,
    // click: () => {
    //   const href = `${window.location.origin + window.location.pathname
    //     }/?activeObjectId=${this.selectedNode} `
    //   navigator.clipboard
    //     .writeText(href)
    //     .then(() => {
    //       this.$store.commit('addAlert', {
    //         type: 'info',
    //         text: 'Ссылка на текущий объект добавлена в буфер обмена',
    //       })
    //     })
    //     .catch((err) => {
    //       console.log('Something went wrong', err)
    //     })
    // },
    color: 'white',
  },
  {
    icon: !expand.value ? 'mdi-chevron-down' : 'mdi-chevron-up',
    tooltip: !expand.value ? 'Развернуть всё' : 'Свернуть всё',
    dark: true,
    disabled: false,
    click: () => {
      expand.value = !expand.value
    },
    color: 'white',
  },
])

</script>

<template>
  <e-window
    name="Обзор"
    icon="mdi-arrow-decision"
    :close="close"
    :buttons="buttons"
    color="bg-blue-9"
  >
    <template v-slot:content>{{ structure }}</template>
  </e-window>
</template>

<style scoped>
</style>
