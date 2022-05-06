<script setup>
import { ref, reactive, onMounted, watch, computed, onUpdated } from 'vue'
import { activeNodeId, nodes, getPorts, getNodeUpdate } from '../stores/nodes'
import { show } from '../stores/show'
import EWindow from './e-window.vue'
import ENode from './e-node.vue'
import EPlaceInfo from './e-place-info.vue'
import ENodeInfo from './e-node-info.vue'
import ENodePort from './e-node-port.vue'
import SNMP from '../api/snmp'
import { msToTime } from '../api/parser'

const gPorts = () => {
  if (node.value && !node.value.ports) getPorts(activeNodeId.value)
}
onMounted(() => {
  gPorts()
})
onUpdated(() => {
  // gPorts()
})
watch(() => activeNodeId.value, gPorts)
const data = {
  name: 'Оборудование',
  icon: 'mdi-card-minus-outline',
}
const close = () => {
  show.commutator = !show.commutator
}
const node = computed(() => {
  return nodes[activeNodeId.value]
})
const ports = computed(() => {
  if (node.value) return node.value.ports
})
const progress = ref(false)
const buttons = computed(() => [
  {
    icon: 'mdi-update',
    tooltip: 'Опросить коммутатор',
    dark: true,
    disabled: false,
    click: async () => {
      progress.value = true
      await getNodeUpdate(node.value)
      progress.value = false
    },
    color: 'white',
  },
  {
    icon: 'mdi-cog-play',
    tooltip: 'Опросить по LLDP',
    dark: true,
    disabled: false,
    click: async () => {
      progress.value = true
      const snmp = SNMP()
      await snmp.getLldp(new Set([node.value.s_id]), false)
      // this.$store.commit('setGraph', this.$store.state.relsNodes)
      progress.value = false
    },
    color: 'white',
  },
])
const info = reactive({
  place: false,
  comm: true,
  node: true,
})
const buttonsCom = computed(() => [
  {
    icon: 'mdi-map-marker',
    tooltip: 'Местоположение',
    color: info.place ? 'blue-9' : 'grey-8',
    click: async () => {
      info.place = !info.place
    },
  },
  {
    icon: 'mdi-nut',
    tooltip: 'Сетевые реквизмиты',
    color: info.node ? 'blue-9' : 'grey-8',
    click: async () => {
      info.node = !info.node
    },
  },
])
const time = computed(() => {
  if (node.value && node.value.startTime) {
    const now = new Date()
    const startTime = new Date(node.value.startTime)
    const passTime = msToTime(now - startTime)
    return {
      startTime: startTime.toLocaleString(),
      passTime,
      now: now.toLocaleString(),
    }
  }
})
</script>
<template>
  <e-window
    :name="data.name"
    :icon="data.icon"
    :close="close"
    :buttons="buttons"
    color="bg-blue-9"
  >
    <template v-slot:content>
      <div class="commutator" v-if="node">
        <div class="node-div">
          <e-node
            :node="node"
            :address="true"
            :disableActive="true"
            :key="node.s_id"
          />
          <q-space />
          <q-btn
            v-for="btn in buttonsCom"
            :color="btn.color"
            @click="btn.click"
            round
            flat
            size="0.8em"
          >
            <q-icon :name="btn.icon" />
            <q-tooltip
              anchor="bottom middle"
              self="bottom middle"
              :offset="[0, 30]"
              >{{ btn.tooltip }}</q-tooltip
            >
          </q-btn>
          <q-space />
        </div>
        <div v-if="info.place || info.comm || info.node" class="e-info">
          <div class="info-cont">
            <e-place-info v-if="info.place" :node="node" :key="node.s_id" />
            <!-- <e-commutator-info v-if="info.comm" :node="node" :key="node.s_id" /> -->
            <e-node-info v-if="info.node" :node="node" :key="node.s_id" />
          </div>
          <div v-if="time" class="time bg-green-1 text-green-10">
            <div class="bg-green-8 text-white">
              {{ time.now }}
            </div>
            <div class="start">{{ time.startTime }}</div>
            <div class="pass">{{ time.passTime }}</div>
          </div>
          <div class="e-ports">
            <div class="e-port bg-grey-8 text-white">
              <div class="p_num">#</div>
              <div class="p_speed">Gb/s</div>
              <div class="p_vlan">Vlan</div>
              <div v-if="node.startTime" class="macs">Mac's</div>
              <div class="p_desc">Примечание</div>
              <div v-if="node.lldp" class="lldp">LLDP</div>
              <div class="pack">
                <div class="p_in">IN</div>
              </div>
              <div class="pack">
                <div class="p_out">OUT</div>
              </div>
              <div v-if="node.startTime" class="p_last">Время</div>
            </div>
            <e-node-port
              v-for="port in ports"
              :port="port"
              :node="node"
              :key="port.p_num"
            />
          </div>
        </div>
      </div>
    </template>
  </e-window>
</template>

<style>
.commutator {
  padding: 0.3em;
  margin-bottom: 4em;
}
.space {
  height: 5em;
}
.e-ports {
  width: 100%;
}
.e-port {
  display: flex;
  margin-top: 1px;
  border-radius: 0.4em;
  overflow: hidden;
  align-items: unset !important;
  padding: 0 !important;
  user-select: unset !important;
  /* max-height: 65px; */
  /* box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12); */
}
.e-port:nth-child(2n) {
  background-color: rgba(199, 233, 255, 0.192);
}
.e-port > div {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5px;
  border-radius: 0;
  cursor: pointer;
  /* text-overflow: ellipsis; */
  /* overflow: hidden; */
  /* word-break: break-all; */
  /* white-space: nowrap; */
}
.p_num {
  width: 30px;
  position: relative;
}
.p_vlan {
  width: 150px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
}
.p_desc {
  min-width: 140px;
  flex-grow: 1;
}
.port-up > .p_num {
  /* border-left: solid 3px green; */
  background-color: green;
  color: white;
  /* margin-left: -3px; */
}
.p_speed {
  width: 40px;
}
.macs {
  width: 40px;
}
.macs > div {
  padding: 5px 5px 3px 5px;
  border: solid thin #212121;
  border-radius: 0.4em;
  font-weight: bold;
  width: 30px;
}
.pack {
  display: flex;
  flex-direction: column;
  width: 100px;
}
.p_last {
  width: 80px;
}
.p_error {
  background-color: #b71c1c;
  padding: 0 5px;
  color: white;
  border-radius: 0.4em;
}
.p-title {
}
.vlan {
  padding: 3px 5px;
  margin-right: 2px;
  margin-bottom: 2px;
  border-radius: 0.4em;
  /* align-content: center; */
  /* justify-items: center; */
}
.pvid {
  /* border: solid thin black; */
  background-color: #c8e6c9;
  color: #1b5e20;
  padding: 3px 5px;
}
.lldp {
  position: relative;
  width: 20em;
}
.change-lldp {
  position: absolute;
  left: -20px;
}
.time {
  display: flex;
  /* margin-left: 10px; */
  margin-bottom: 0.5em;
  justify-content: space-around;
  border-radius: 5px;
  overflow: hidden;
}
.time > div {
  width: 100%;
  padding: 0.3em;
  text-align: center;
}
.node-div {
  /* width: 35em; */
  display: flex;
  align-items: center;
}
</style>
