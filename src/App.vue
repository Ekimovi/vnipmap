<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { show } from './stores/show'
import { useRoute } from 'vue-router'
import { activeNodeId, graph, searchField } from './stores/nodes'
import EMainMenu from './components/e-main-menu.vue'
import ETree from './components/e-tree.vue'
import EGraph from './components/e-graph.vue'
import ECommutator from './components/e-commutator.vue'

const keyDown = (e) => {
  if (e.altKey && e.keyCode == 77) {
    show.mainMenu = !show.mainMenu
  } else if (e.keyCode >= 48 && e.keyCode <= 90) {
    if (!show.mainMenu) searchField.value = ''
    searchField.value
      ? (searchField.value += e.key)
      : (searchField.value = e.key)
    show.mainMenu = true
  }
}

onMounted(() => {
  document.addEventListener('keydown', keyDown)
})

const route = useRoute()

watch(
  () => route.query.activeNodeId,
  (id) => {
    activeNodeId.value = id
  }
)
const alertShow = ref(false)
watch(show.alert, () => {
  alertShow.value = true
  setTimeout(() => {
    alertShow.value = false
  }, 3000)
})
const alertMsg = computed(() => show.alert[show.alert.length - 1])
</script>

<template>
  <div class="main bg-grey-3">
    <e-tree v-if="show.tree && graph.allTrees" />
    <e-commutator v-if="show.commutator && graph.allTrees" />
    <q-space />
    <e-graph v-if="show.graph && graph.allTrees" />
    <div class="bot">
      <e-main-menu />
    </div>
    <q-dialog v-model="alertShow" :auto-close="true" seamless position="top">
      <q-banner class="bg-orange-8 text-white">
        <template v-slot:avatar>
          <q-icon name="mdi-alert" />
        </template>
        {{ alertMsg }}
      </q-banner>
    </q-dialog>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}
.main {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 0.2em;
  padding-right: 0;
}
.bot {
  position: absolute;
  bottom: 8px;
  left: calc(100vw / 2 - 10px);
  width: 30px;
}
div::-webkit-scrollbar {
  width: 0.2em;
  /* background-color: #f5f5f5; */
}

div::-webkit-scrollbar-thumb {
  background-color: #9b9999;
}

.q-dialog__backdrop {
  background: rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(9px);
}
.rot {
  animation: rot 3s linear infinite;
}
@keyframes rot {
  100% {
    transform: rotate(350deg);
  }
}
</style>
