<script setup>
import { computed } from 'vue'
import { activeNodeId } from '../stores/nodes'

const emit = defineEmits(['clickNode', 'clickAddress'])

const { node, nodePrev, address } = defineProps(['node', 'nodePrev', 'address'])

const nodeIcon = () => {
  switch (node.type) {
    case 1:
      return 'mdi-hexagon-slice-6'
    case 0:
      return 'mdi-nut'
    default:
      return 'mdi-help-circle-outline'
  }
}

const nodeIconColor = () => {
  if (
    node.type == 1 &&
    node.s_monitor == 1 &&
    node.s_state != 'DIE'
  )
    return 'green-9'
  if (node.s_state == 'NEW') return 'blue-6'
  if (node.s_monitor == 1) return 'grey-6'
  return node.s_state == 'DIE'
    ? 'red-9'
    : 'green-9'
}

const nodeAddress = computed(
  () => {
    const korp = node.ad_korp ? `/${node.ad_korp}` : ''
    return { addr: `${node.ad_street} ${node.ad_home}` + korp, city: node.city }
  }
) 
</script>

<template>
  <div v-if="address" class="address">
    <q-icon name="home" />
    <div style="margin-left: 5px; font-weight: bold">{{ nodeAddress.addr }}</div>
    <q-space />
    <div class="text-grey-8">{{ nodeAddress.city }}</div>
  </div>
  <q-item
    clickable
    v-ripple
    dense
    :active="node.s_id == activeNodeId"
    active-class="my-active"
    @click="emit('clickNode', node)"
  >
    <div class="node">
      <q-icon size="1.5em" :name="nodeIcon()" class="n-icon" :color="nodeIconColor()"></q-icon>
      <div class="n-content">
        <div class="n-locate">
          {{ node.s_locate.substring(0, 5) }} {{ node.s_locate.length > 5 ? '...' : '' }}
          <q-tooltip
            v-if="node.s_locate.length > 5"
            anchor="top middle"
            self="bottom middle"
            :offset="[0, 10]"
          >{{ node.s_locate }}</q-tooltip>
        </div>
        <div class="n-model">{{ node.m_model }}</div>
        <div class="n-ip">{{ node.s__ip }}</div>
        <!-- <div :class="`n-ip bg-${nodeIconColor()} text-white`">{{ node.s__ip }}</div> -->
      </div>
    </div>
  </q-item>
</template>

<style lang="sass" scoped>

.node
  display: flex
  flex-direction: row
  align-items: center

  & > div
    padding: 0 5px
    text-align: center

.n-content
  display: flex

.address
  display: flex
  align-items: center
  color: $blue-10
  /* font-weight: bold */
  border-bottom: solid thin $blue-9
  /* margin: 5px 5px 0 5px */
  cursor: pointer
  margin: 0 1em
  padding: 5px
  padding-bottom: 0px
/* .n-content > div:not(:last-child)::after */
/*   content: '' */
/*   position: absolute */
/*   top: 0 */
/*   right: -10px */
/*   border-left: 5px solid */
/*   border-top: 11px solid */
/*   border-color: inherit */
/*   border-right: 5px solid transparent */
/*   border-bottom: 11px solid transparent */
/**/
/* .n-content > div:not(:first-child):before */
/*   content: '' */
/*   position: absolute */
/*   bottom: 0 */
/*   left: -10px */
/*   border-right: 5px solid */
/*   border-bottom: 11px solid */
/*   border-color: inherit */
/*   border-left: 5px solid transparent */
/*   border-top: 11px solid transparent */

.n-icon
  width: 20px

.n-locate
  position: relative
  width: 80px
  border-color: $grey-8

.n-model
  position: relative
  width: 200px
  border-color: $grey-4

.n-ip
  position: relative
  width: 8em

.border-red-9
  border-color: $red-9

.border-green-9
  border-color: $green-9

.border-grey-6
  border-color: $grey-6

.border-blue-6
  border-color: $blue-6

.my-active
  background: $blue-1
  color: $blue-10
  /* border-right: solid 0.2em $blue-10 */
  /* padding-left: calc(16px - 0.2em) */
</style>
