<script setup>
import { computed, ref } from '@vue/reactivity'
import { msToTime } from '../api/parser'
import { nodes } from '../stores/nodes'
import ENode from './e-node.vue'

const props = defineProps(['node', 'port'])

const time = ref(false)
const lldp = computed(() => {
  const lldpPort = props.node.lldp[props.port.p_index]
  if (!lldpPort) return
  const remoteNode = findNodeByMac(lldpPort.r_mac)
  const res = remoteNode || lldpPort
  return res
})
const untag = computed(() => {
  const untagVlans = props.port.cP_untag || ''
  return untagVlans.split(',').filter((vlan) => vlan != 0)
})
const tag = computed(() => {
  const tagVlans = props.port.cP_tag || ''
  return tagVlans.split(',').filter((vlan) => vlan != 0)
})
const changeTime = computed(() => {
  return new Date(
    props.node.startTime + props.port.change.object.miliseconds
  ).toLocaleString()
})
const pastTime = computed(() => {
  time.value
  const now = new Date().getTime()
  const change = new Date(
    props.node.startTime + props.port.change.object.miliseconds
  ).getTime()
  return msToTime(now - change)
})
const numClass = computed(() => {
  if (props.port.p_admin == 2) return 'bg-red-8 text-white'
  if (props.port.p_oper == 1) return 'bg-green-8 text-white'
})
function delPortLink() {
  props.port.p_link = null
}
const changePortLink = () => {
  props.port.p_link = lldp.value.s_id
}
function findNodeByMac(mac) {
  for (const key in nodes) {
    const node = nodes[key]
    if (node.s_mac && node.s_mac.toUpperCase() == mac.toUpperCase()) return node
  }
}
function getShortVlans(vlans) {
  return vlans.slice(0, 25) + '...'
}
function getSpeed(speed) {
  const sp = { 10: '0.01', 100: '0.1', 1000: '1', 10000: '10' }
  if (speed in sp) return sp[speed]
  return speed
}
</script>

<template>
  <div class="e-port">
    <div class="p_num" :class="numClass">
      {{ props.port.p_num }}
      <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
        {{ props.port.p_name }}</q-tooltip
      >
    </div>
    <div
      class="p_speed"
      :class="
        getSpeed(props.port.p_speed) == 10 && props.port.p_oper == 1
          ? 'bg-green-8 text-white'
          : ''
      "
    >
      {{ getSpeed(props.port.p_speed) }}
    </div>
    <div class="p_vlan" style="max-width: 300px">
      <div
        v-for="untagVlan in untag"
        :key="untagVlan"
        class="vlan bg-green-1 text-green-10"
      >
        {{ untagVlan }}
      </div>
      <div style="width: 3px"></div>
      <div
        v-for="tagVlan in tag"
        :key="tagVlan"
        class="vlan bg-blue-1 text-blue-10"
      >
        {{ tagVlan }}
      </div>
    </div>
    <div v-if="props.port.m_macs" class="macs">
      <div
        v-if="props.port.m_macs.length > 0"
        :class="props.port.m_macs.length > 1 ? 'bg-grey-8 text-white' : ''"
      >
        <div>{{ props.port.m_macs.length }}</div>
      </div>
      <q-tooltip
        v-if="props.port.m_macs.length"
        anchor="center right"
        self="center left"
        :offset="[10, 10]"
      >
        <div v-for="mac in props.port.m_macs" :key="mac.mac">
          {{ `${mac.mac} : ${mac.vlan}` }}
        </div>
      </q-tooltip>
    </div>
    <div class="p_desc">
      <e-node
        v-if="props.port.p_link && nodes[props.port.p_link]"
        :node="nodes[props.port.p_link]"
        :address="true"
        :mini="true"
      />
      {{
        props.port.p_link && nodes[props.port.p_link] ? '' : props.port.p_desc
      }}
    </div>
    <div v-if="props.node.lldp" class="lldp">
      <e-node
        v-if="lldp && lldp.s_id"
        :node="lldp"
        :address="true"
        :mini="true"
      />
      <q-btn
        v-if="lldp && lldp.s_id && lldp.s_id != props.port.p_link"
        color="orange-8"
        class="change-lldp"
        @click="changePortLink"
        round
        size="0.8em"
        ><q-icon name="mdi-arrow-left-bold"
      /></q-btn>
      <q-btn
        v-if="props.port.p_link && !(lldp && lldp.s_id)"
        color="red-3"
        class="change-lldp"
        @click="delPortLink"
        round
        size="0.8em"
        ><q-icon name="mdi-close"
      /></q-btn>
      <div v-if="lldp && !lldp.s_id">{{ lldp.r_name }}</div>
    </div>
    <div class="pack">
      <div class="p_in">
        {{ props.port.p_in || '' }}
      </div>
      <div :class="props.port.p_in_error != '0' ? 'p_error' : ''">
        {{ props.port.p_in_error == '0' ? '' : props.port.p_in_error }}
      </div>
    </div>
    <div class="pack">
      <div class="p_out">
        {{ props.port.p_out || '' }}
      </div>
      <div :class="props.port.p_out_error != '0' ? 'p_error' : ''">
        {{ props.port.p_out_error == '0' ? '' : props.port.p_out_error }}
      </div>
    </div>
    <div v-if="props.port.change" @mouseenter="time = !time" class="p_last">
      <div>{{ changeTime }}</div>
      <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
        {{ pastTime }}
      </q-tooltip>
    </div>
  </div>
</template>

<style scoped></style>
