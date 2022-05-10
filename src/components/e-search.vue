<script setup>
import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import {
  nodes,
  getNodes,
  activeNodeId,
  force,
  searchField,
} from '../stores/nodes'
import { show } from '../stores/show'
import { debounce } from 'quasar'
import translit from '../utils/translit'
import ENode from './e-node.vue'
// import ENodeList from './e-node-list.vue'

onUnmounted(() => {})

const selectIndex = ref(0)
const history = ref(JSON.parse(localStorage.getItem('history')) || [])
const addNodeToHistory = (node) => {
  history.value = [node, ...history.value.filter((n) => n.s_id != node.s_id)]
  localStorage.setItem('history', JSON.stringify(history.value.slice(0, 15)))
}
const clickNode = (node) => {
  addNodeToHistory(node)
  force.value = true
  activeNodeId.value = node.s_id
  show.mainMenu = false
}

const searchResult = computed(() => Object.values(nodes.inUse.search))

const gNodes = async (text) => {
  /* this.loading = true */
  /* this.items = [] */
  const getProp = (v) => {
    const regIp = /\d+\.\d+/
    const regNioss = /\d{5}/
    const eng = /[A-Za-z\[]/
    if (regIp.test(v)) return { s__ip: v }
    if (regNioss.test(v)) return { niossname: v }
    if (eng.test(v)) {
      searchField.value = translit(v)
      return false
    }
    return { s_address: v }
  }

  const prop = getProp(text)

  if (prop) {
    await getNodes(prop, 'search')
    selectIndex.value = 0
  }

  /* this.items = data */
  /* this.showMenu = false */
  /* setTimeout(() => { */
  /*   this.showMenu = true */
  /* }, 10) */
  /*  */
  /* this.loading = false */
}

watch(searchField, (val, oldVal) => {
  val && val != oldVal && val.length > 4 && dGetNodes(val)
  if (!val) nodes.inUse.search = {}
})

const dGetNodes = debounce(gNodes, 500)

const changeSelectIndex = (offset) => {
  if (selectIndex.value + offset > searchResult.value.length - 1) {
    selectIndex.value = 0
    return
  }
  if (selectIndex.value + offset < 0) {
    selectIndex.value = searchResult.value.length - 1
    return
  }
  selectIndex.value += offset
}
const key = (e) => {
  e.stopPropagation()
  if (e.keyCode == 40) changeSelectIndex(1)
  if (e.keyCode == 38) changeSelectIndex(-1)
}
const altKey = (e) => {
  e.stopPropagation()
  if (e.keyCode == 77) show.mainMenu = false
  if (e.keyCode == 72) searchField.value = ''
  if (e.keyCode == 74) changeSelectIndex(1)
  if (e.keyCode == 75) changeSelectIndex(-1)
}
const setActiveNode = () => {
  const selectedNode = nodesList.value[selectIndex.value]
  if (selectedNode) {
    clickNode(selectedNode)
  }
}
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
    searchResult.value.reduce((prev, node) => {
      const key = node.ad_id
      key in prev ? prev[key].push(node) : (prev[key] = [node])
      return prev
    }, {})
  )
})
const nodesList = computed(() => {
  return [].concat.apply([], groupedNodes.value)
})
</script>

<template>
  <div class="my-column search">
    <div class="bg-grey-8 text-white m-title">
      <q-icon size="1.5em" name="mdi-history" />
      <q-space />История поиска
      <q-space />
    </div>
    <div class="result">
      <div v-for="node in history" class="group bg-white shadow-2">
        <e-node :node="node" :address="true" @click-node="clickNode" />
      </div>
    </div>
  </div>
  <div class="my-column search">
    <q-input
      dense
      rounded
      standout="bg-teal-8 text-white"
      autofocus
      v-model="searchField"
      color="grey-6"
      bg-color="white"
      label="Поиск"
      clearable
      @keydown.exact="key"
      @keydown.alt.exact="altKey"
      @keypress.enter="setActiveNode"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div v-if="searchResult.length > 0" class="result">
      <div v-for="group in groupedNodes" class="group bg-white shadow-2">
        <e-node
          v-for="(node, i) in group"
          :node="node"
          :address="i == 0"
          @click-node="clickNode(node)"
          :key="node.s_id"
          :select="
            nodesList[selectIndex] && node.s_id == nodesList[selectIndex].s_id
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-column {
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
  justify-content: center;
  /* backdrop-filter: blur(5px); */
  /* background-color: rgb(100%, 100%, 100%, 0.5); */
  /* max-height: 800px; */
  /* overflow: hidden; */
}
.search {
  width: 32em;
  /* padding: 10px; */
  max-height: calc(100vh - 3em);
}
.m-title {
  display: flex;
  align-items: center;
  height: 2em;
  border-radius: 2em;
  font-size: 1.2em;
  font-weight: bold;
  padding: 0 0.5em;
}
.result {
  margin: 10px -10px 0 0;
  padding-right: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  /* flex-grow: 1; */
}
.node-w {
  padding-bottom: 0.3em;
}
.group {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  border-radius: 0.3em;
}
</style>
