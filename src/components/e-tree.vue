<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { show } from '../stores/show'
import { activeNodeId, graph } from '../stores/nodes'
import EWindow from './e-window.vue'
import ENode from './e-node.vue'
import ECircle from './e-circle.vue'

const structure = computed(() => {
  console.log('graph', graph.value)
  const trees = graph.value.allTrees
  if (!trees)
    return {
      uplink: undefined,
      startMu: undefined,
      allTrees: undefined,
      otherMu: [],
    }
  if (graph.value.allTrees.length == 1) expand.val = true
  else expand.val = false
  const nearMu = trees
    .filter((t) => t.tree.length == 2 && t.tree[t.tree.length - 1].node.type)
    .map((t) => t.tree[t.tree.length - 1].node)
  const startMu = trees[0].tree[0].node
  const uplink = nearMu.find((n) => n.s_id == startMu.s_hub1)
  const otherMu = nearMu.filter((n) => n.s_id != startMu.s_hub1)
  const circlePort = (tree) => {
    const relNode = tree[1]
    if (!relNode) return null
    if (relNode.node.s_id != relNode.rel.a_id) return relNode.rel.a_port
    return relNode.rel.b_port
  }
  trees.forEach((tree) => {
    tree.circlePort = circlePort(tree.tree)
  })
  const allTrees = trees
    .filter((t) => t.tree.length != 2 || !t.tree[t.tree.length - 1].node.type)
    .sort((a, b) => {
      const regexp = /[0-9]+$/
      const aa = a.circlePort || '999',
        bb = b.circlePort || '999'
      return Number(aa.match(regexp)) - Number(bb.match(regexp))
    })
  return { uplink, startMu, allTrees, otherMu }
})
const close = () => {
  show.tree = !show.tree
}
const expand = reactive({ val: false })
const buttons = computed(() => [
  {
    icon: show.treeAdd ? 'mdi-card-minus-outline' : 'mdi-card-plus',
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
    icon: !expand.val ? 'mdi-chevron-down' : 'mdi-chevron-up',
    tooltip: !expand.val ? 'Развернуть всё' : 'Свернуть всё',
    dark: true,
    disabled: false,
    click: () => {
      expand.val = !expand.val
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
    <template v-if="structure.startMu" v-slot:content>
      <template v-if="structure.uplink">
        <div class="text-subtitle2">UpLink</div>
        <div style="margin-right: 1em; margin-left: 0.6em">
          <e-node :node="structure.uplink" :address="true" />
        </div>
      </template>
      <div class="text-subtitle2">Root</div>
      <div style="margin-right: 1em; margin-left: 0.6em">
        <e-node :node="structure.startMu" :address="true" />
      </div>
      <div class="text-subtitle2">Кольца</div>
      <e-circle
        v-for="(tree, i) in structure.allTrees"
        :tree="tree"
        :expand="expand"
        :key="tree.tree[1].node.s_id"
      />
    </template>
  </e-window>
</template>

<style scoped>
.text-subtitle2 {
  margin: 0.5em 1em;
}
</style>
