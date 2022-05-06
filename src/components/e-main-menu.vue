<script setup>
import { show } from '../stores/show'
// import { history } from '../stores/nodes'
import ESearch from './e-search.vue'
import ENode from './e-node.vue'

/* import { nodes, rels } from './stores/nodes' */
</script>

<template>
  <q-btn
    size="md"
    round
    icon="dashboard"
    color="primary"
    @click="show.mainMenu = !show.mainMenu"
  />
  <q-dialog
    v-model="show.mainMenu"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <div class="dashboard">
      <div class="search">
        <e-search />
      </div>
      <div class="bar">
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            disable
            icon="mdi-bookmark-multiple"
            :color="show.collections ? 'primary' : 'grey-8'"
            @click="show.collections = !show.collections"
          />
          <div class="lab">Коллекция</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            icon="mdi-arrow-decision"
            :color="show.tree ? 'primary' : 'grey-8'"
            @click="show.tree = !show.tree"
          />
          <div class="lab">Обзор кольца</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            icon="mdi-graph"
            :color="show.graph ? 'primary' : 'grey-8'"
            @click="show.graph = !show.graph"
          />
          <div class="lab">Граф</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            icon="dashboard"
            color="negative"
            @click="show.mainMenu = !show.mainMenu"
          />
          <div class="lab">Закрыть панель</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            disable
            icon="mdi-help"
            :color="show.help ? 'primary' : 'grey-8'"
            @click="show.help = !show.help"
          />
          <div class="lab">Помощь</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            disable
            icon="settings"
            :color="show.settings ? 'primary' : 'grey-8'"
            @click="show.settings = !show.settings"
          />
          <div class="lab">Настройки</div>
        </div>
        <div class="row items-center">
          <q-btn
            size="0.9em"
            round
            disable
            icon="person"
            :color="show.person ? 'primary' : 'grey-8'"
            @click="show.person = !show.person"
          />
          <div class="lab">Login</div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
.bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33%;
  font-size: 0.9em;
  max-height: calc(100vh - 5em);
  overflow: hidden;
}
.bar > div {
  margin: 3px;
}
.lab {
  width: 10em;
  margin-left: 2em;
  color: grey;
  /* text-align: center; */
  font-weight: bold;
}
.group {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  border-radius: 5px;
  width: 34em;
}

.group > div {
  display: flex;
  flex-direction: row;
}

.search {
  width: 67%;
  display: flex;
  justify-content: space-around;
}
</style>
