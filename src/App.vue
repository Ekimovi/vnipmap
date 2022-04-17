<script setup>
import { reactive, onMounted, watch } from 'vue'
import { show } from './stores/show'
import { useRoute } from 'vue-router'
import { activeNodeId } from './stores/nodes'
import EMainMenu from './components/e-main-menu.vue'
import ETree from './components/e-tree.vue'

const keyDown = (e) => {
  if (e.ctrlKey && e.key == ' ') show.mainMenu = !show.mainMenu
}

onMounted(() => {
  document.addEventListener('keydown', keyDown)
})

const route = useRoute()

watch(
  () => route.query.activeNodeId,
  id => {
    activeNodeId.value = id
  }
)
</script>

<template>
  <div class="main">
    <e-tree v-if="show.tree" />
    <div class="bot">
      <e-main-menu />
    </div>
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
  background-color: lightgray;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 5px;
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
  background: none !important;
  backdrop-filter: blur(9px);
}
</style>
