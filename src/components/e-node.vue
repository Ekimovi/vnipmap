<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { activeNodeId, force, ping } from '../stores/nodes'

const emit = defineEmits(['clickNode', 'clickAddress', 'ref'])

const props = defineProps([
  'node',
  'address',
  'disableActive',
  'disablePing',
  'mini',
  'select',
])
const nodeIcon = () => {
  switch (props.node.type) {
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
    props.node.type == 1 &&
    props.node.s_monitor == 1 &&
    props.node.s_state != 'DIE'
  )
    return 'green-9'
  if (props.node.s_state == 'NEW') return 'blue-6'
  if (props.node.s_monitor == 1) return 'grey-6'
  return props.node.s_state == 'DIE' ? 'red-9' : 'green-9'
}

const nodeAddress = computed(() => {
  const korp = props.node.ad_korp ? `/${props.node.ad_korp}` : ''
  return {
    addr: `${props.node.ad_street} ${props.node.ad_home}` + korp,
    city: props.node.city,
  }
})
const nodeClass = computed(() => {
  let cl = 'node'
  if (props.node.s_id == activeNodeId.value && !props.disableActive)
    cl += ' my-active'
  if (props.select) cl += ' selected'
  return cl
})

const nodeRef = ref(null)
onMounted(() => {
  emit('ref', nodeRef)
})
</script>

<template>
  <div v-if="props.node" class="e-node">
    <div v-if="props.address" class="address">
      <q-icon name="home" />
      <div style="margin-left: 5px; font-weight: bold">
        {{ nodeAddress.addr }}
      </div>
      <q-space />
      <div class="text-grey-8">{{ nodeAddress.city }}</div>
    </div>
    <div
      ref="nodeRef"
      :class="nodeClass"
      @click="emit('clickNode', props.node)"
      @click.ctrl="force = true"
    >
      <q-icon
        v-if="!props.mini"
        size="1.5em"
        :name="nodeIcon()"
        class="n-icon"
        :color="nodeIconColor()"
      >
        <slot></slot>
      </q-icon>
      <div class="n-locate bg-grey-8 text-white">
        {{ props.node.s_locate }}
        <q-tooltip
          v-if="props.node.s_locate.length > 5"
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 10]"
          >{{ props.node.s_locate }}</q-tooltip
        >
      </div>
      <div class="n-model">{{ props.node.m_model }}</div>
      <div v-if="!props.mini" :class="`n-ip bg-${nodeIconColor()} text-white`">
        <q-space />
        {{ props.node.s__ip }}
        <q-space />
        <q-btn
          v-if="!props.disablePing"
          @click.prevent.stop="ping(props.node)"
          round
          flat
          size="0.8em"
          :class="props.node.ping ? 'rot' : ''"
        >
          <q-icon name="mdi-swap-horizontal" />
        </q-btn>
      </div>
      <!-- <div :class="`n-ip bg-${nodeIconColor()} text-white`">{{ node.s__ip }}</div> -->
    </div>
    <div v-if="props.mini" class="mini">
      <q-icon
        size="1.5em"
        :name="nodeIcon()"
        class="n-icon"
        :color="nodeIconColor()"
      ></q-icon>
      <div :class="`n-ip bg-${nodeIconColor()} text-white`" style="width: 100%">
        <q-space />
        {{ props.node.s__ip }}
        <q-space />
        <q-btn
          v-if="!props.disablePing"
          @click.prevent.stop="ping(props.node)"
          round
          flat
          size="0.8em"
          :class="props.node.ping ? 'rot' : ''"
        >
          <q-icon name="mdi-swap-horizontal" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.e-node
  display: flex
  flex-direction: column

.node
  display: flex
  flex-direction: row
  align-items: center
  width: 100%
  cursor: pointer
  padding: 0.5em

  & > div
    padding: 0 5px
    text-align: center

.mini
  display: flex
  flex-direction: row
  align-items: center
  width: 100%
  cursor: pointer
  padding: 0em 0.5em
  margin-bottom: 0.2em

.address
  display: flex
  align-items: center
  color: $blue-10
  /* font-weight: bold */
  border-bottom: solid thin $blue-9
  /* margin: 5px 5px 0 5px */
  cursor: pointer
  margin: 0 .5em
  /* padding: 5px */
  padding-top: 0.2em
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
  border-radius: 0.3em
  width: 5em
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  padding: 0 0.5em

.n-model
  position: relative
  /* max-width: 15em */
  flex-grow: 1
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  border-color: $grey-4

.n-ip
  display: flex
  flex-direction: row
  border-radius: 0.3em
  width: 10em
  height: 1.6em
  align-items: center
  overflow: hidden

.border-red-9
  border-color: $red-9

.border-green-9
  border-color: $green-9

.border-grey-6
  border-color: $grey-6

.border-blue-6
  border-color: $blue-6

.my-active
  background-color: $blue-1
  /* border-right: solid 0.2em $blue-10 */
  /* padding-left: calc(16px - 0.2em) */

.selected
  background-color: $grey-4
</style>
