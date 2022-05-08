<script setup>
import ENode from './e-node.vue'
import { reactive } from 'vue'
import { nodes, activeNodeId, delRels } from '../stores/nodes'

const data = reactive({
  selectedRels: [],
  showBadRels: true,
})
const {} = defineProps(['tree', 'badRels', 'circles', 'duNodes'])
function delSelectedRels() {
  delRels(data.selectedRels)
}
</script>

<template>
  <div
    class="tit"
    v-if="Object.keys(badRels).length"
    @click="data.showBadRels = !data.showBadRels"
  >
    <q-icon
      color="orange-8"
      style="margin-right: 10px"
      name="mdi-image-broken-variant"
    >
    </q-icon>
    Неактивные связи
    <div class="count orange-8 text-white">
      {{ Object.keys(badRels).length }}
    </div>
    <q-space />
    <q-icon
      :name="!data.showBadRels ? 'mdi-chevron-down' : 'mdi-chevron-up'"
    ></q-icon>
  </div>
  <div v-show="data.showBadRels">
    <div v-for="(br, key) in badRels" class="str" :key="key">
      <q-checkbox v-model="data.selectedRels" :val="key" color="red" />
      <e-node
        :node="nodes[br.a_id]"
        :mini="true"
        :address="true"
        @clickNode="activeNodeId = $event.s_id"
      />
      <div class="rel bg-red-8"></div>
      <e-node
        :node="nodes[br.b_id]"
        :mini="true"
        :address="true"
        @clickNode="activeNodeId = $event.s_id"
      />
    </div>
    <div class="str" style="margin: 5px">
      <q-space />
      <q-btn
        :disabled="!data.selectedRels.length"
        @click="delSelectedRels"
        color="red-8"
        >Удалить</q-btn
      >
    </div>
  </div>
</template>

<style scoped>
.tit {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 3px;
  /* padding: 5px 10px; */
  /* font-weight: bold; */
  color: #e65100;
  border-bottom: solid thin #e65100;
  cursor: pointer;
}
.str {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1em;
}
.rel {
  width: 1em;
  height: 0.2em;
  /* border-radius: 5px; */
  /* background-color: tomato; */
}
.str > div {
}
.count {
  border-radius: 3px;
  padding: 0 10px;
  font-weight: bold;
  margin-left: 10px;
}
.index {
  width: 50px;
}
</style>
