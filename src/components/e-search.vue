<script setup>
import { ref, reactive, watch } from 'vue'
import { getNodes } from '../stores/nodes'
import { debounce } from 'quasar'
import translit from '../utils/translit'
import ENode from './e-node.vue'
import ENodeList from './e-node-list.vue'
import { useRouter } from 'vue-router'

const history = ref(JSON.parse(localStorage.getItem('history')) || [])
const router = useRouter()

function pushAciveNodeId(activeNodeId) {
  router.push({
    path: '/',
    query: {
      activeNodeId,
    },
  })
}
const addNodeToHistory = node => {
  history.value = [node, ...history.value.filter(n => n.s_id != node.s_id)]
  localStorage.setItem('history', JSON.stringify(history.value.slice(0, 15)))
}
const clickNode = node => {
  addNodeToHistory(node)
  pushAciveNodeId(node.s_id)
}

const searchField = ref('')
const nodes = reactive({
  val: []
})

const gNodes = async text => {
  /* this.loading = true */
  /* this.items = [] */
  const getProp = v => {
    const regIp = /\d+\.\d+/
    const regNioss = /\d{5}/
    if (regIp.test(v)) return { s__ip: v }
    if (regNioss.test(v)) return { niossname: v }
    return { s_address: translit(v) }
  }

  const prop = getProp(text)

  nodes.val = await getNodes(prop)

  /* this.items = data */
  /* this.showMenu = false */
  /* setTimeout(() => { */
  /*   this.showMenu = true */
  /* }, 10) */
  /*  */
  /* this.loading = false */
}

watch(searchField, (val, oldVal) => {
  val &&
    val != oldVal &&
    val.length > 4 &&
    dGetNodes(val)
  !val && (nodes.val = [])
})

const dGetNodes = debounce(gNodes, 500)

</script>

<template>
  <div class="my-column search">
    <div class="bg-grey-8 text-white m-title">
      <q-icon size="1.5em" name="mdi-history" />
      <q-space />История поиска
      <q-space />
    </div>
    <div class="result">
      <div v-for="node in history" class="node-w bg-white">
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
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div v-if="nodes.val.length > 0" class="result">
      <e-node-list :nodes="nodes.val" @click-node="clickNode" />
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
  width: 35em;
  /* padding: 10px; */
  max-height: calc(100vh - 3em);
}
.m-title {
  display: flex;
  align-items: center;
  height: 2.9em;
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
</style>
