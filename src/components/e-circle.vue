<script setup>
import { reactive, computed, watch } from 'vue'
import { nodes, ping, graph } from '../stores/nodes'
import ETreeContent from './e-tree-content.vue'
import SNMP from '../api/snmp'
import { show } from '../stores/show'

const { tree, expand } = defineProps(['tree', 'expand'])
const snmp = SNMP()

const data = reactive({
  pingClickStatus: false,
  exploreStatus: false,
  showContent: expand.val,
})
watch(
  () => expand.val,
  (val) => {
    data.showContent = val
  }
)
const duNodes = computed(() => {
  const res = []
  for (const nId of tree.treeNodes) {
    const node = nodes[nId]
    if (node.type != 1) res.push(node)
  }
  return res
})
const circles = computed(() => {
  const res = duNodes.value.reduce((p, n) => {
    if (n.c_id in p) p[n.c_id].count++
    else p[n.c_id] = { c_id: n.c_id, c_type: n.c_type, count: 1 }
    return p
  }, {})
  return res
})
const maxCountCid = computed(() => {
  const notNull = Object.values(circles).filter((c) => c.c_id != null)
  if (notNull.length > 0) return notNull.sort((a, b) => a.count - b.count)[0]
  return null
})
const cId = computed(() => {
  if (maxCountCid) return maxCountCid.c_id
  return null
})
const realCType = computed(() => {
  const fNode = tree.tree[0].node
  const sNode = tree.tree[tree.tree.length - 1].node
  if (sNode.type != 1) return { c_type: 0, ma_id: fNode.s_id, mb_id: null }
  if (fNode.s_id == sNode.s_id)
    return { c_type: 1, ma_id: fNode.s_id, mb_id: fNode.s_id }
  return { c_type: 2, ma_id: fNode.s_id, mb_id: sNode.s_id }
})
// const needIndex = computed(() => {
//   const r = !!(
//     Object.keys(circles.value).length > 1 ||
//     'null' in circles.value ||
//     this.maxCountCid.c_type != this.realCType.c_type
//   )
//   return r
// })
const badRels = computed(() => {
  let relsNodes = []
  duNodes.value.forEach((node) => {
    relsNodes.push(...graph.value.graph[node.s_id])
  })
  const badRels = relsNodes.reduce((p, rn) => {
    if (!(rn.rel.source == 'correct' || rn.rel.source == 'lldp'))
      p[rn.rel.id] = rn.rel
    return p
  }, {})
  return badRels
})
const pingStatus = computed(() => {
  for (const id of tree.treeNodes) {
    if (nodes[id].ping) return true
  }
  return false
})
const countNodes = computed(() => {
  return tree.treeNodes.size
})
const countDieNodes = computed(() => {
  let c = 0
  for (let id of tree.treeNodes) {
    const node = nodes[id]
    if (node && node.s_monitor == 0 && node.s_state == 'DIE') c++
  }
  return c
})
/* const gEvent = computed(()=>{
  return this.$store.state.gEvent
}) */
const cColor = computed(() => {
  const styles = {
    0: 'bg-grey-5',
    1: 'bg-orange-8',
    2: 'bg-green-8',
  }
  return styles[realCType.value.c_type]
})
/* watch(pingStatus, val => {
  if (!val) {
    data.pingClickStatus = false
    if (data.exploreStatus) getLldp()
  }
}) */
const exploreTree = async () => {
  data.exploreStatus = true
  const filterNodesIdForLldp = () => {
    const filteredNodesIdSet = new Set()
    for (let id of tree.treeNodes) {
      const node = nodes[id]
      if (node.s_monitor == 0 && node.s_state == 'LIFE' && node.type != 1)
        filteredNodesIdSet.add(id)
    }
    return filteredNodesIdSet
  }
  const beforeUpdateGraph = () => {
    treeRels.value.forEach((rel) => {
      rel.updated = true
    })
  }
  await snmp.getLldp(
    filterNodesIdForLldp(tree.treeNodes),
    true,
    beforeUpdateGraph
  )
  /* this.$store.commit('setGraph', this.$store.state.relsNodes) */
  data.exploreStatus = false
}
const pingTree = () => {
  data.pingClickStatus = true
  for (let id of tree.treeNodes) {
    const node = nodes[id]
    if (node.s_monitor == 0) pingNode(node)
  }
}
const pingNode = (node) => {
  if (!node.ping) {
    ping(node)
  }
}
const showContent = () => {
  data.showContent = !data.showContent
}
const treeRels = computed(() => {
  return duNodes.value.reduce((treeRels, node) => {
    graph.value.graph[node.s_id].forEach((rn) => {
      treeRels.push(rn.rel)
    })
    return treeRels
  }, [])
})
const updated = computed(() => {
  try {
    treeRels.value.forEach((rel) => {
      if (!rel.updated) throw ''
    })
  } catch (e) {
    return false
  }
  return true
})
</script>

<template>
  <div class="circle-main">
    <div class="circle" @click="showContent">
      <div :class="'c-type ' + cColor"></div>
      <!--<div class="c-label grey darken-3">
        <div class="c-id">{{ cId || '?' }}</div>
      </div>-->
      <div class="bg-grey-9 text-white c-port">{{ tree.circlePort }}</div>
      <q-chip color="blue-9" square outline>{{ countNodes }}</q-chip>
      <q-chip v-if="countDieNodes" color="red-9" text-color="white" square>{{
        countDieNodes
      }}</q-chip>
      <q-space />
      <!-- <q-btn round size="0.7em" flat>
        <q-icon
          :name="data.showContent ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          color="black"
        />
      </q-btn> -->
      <q-btn
        size="0.7em"
        flat
        round
        @click.prevent.stop="pingTree"
        :class="data.pingClickStatus && pingStatus ? 'rot' : ''"
      >
        <q-icon name="mdi-swap-horizontal" color="" />
        <q-tooltip
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 0]"
          :delay="1000"
        >
          Пинг коммутаторов кольца
        </q-tooltip>
      </q-btn>
      <q-btn
        size="0.7em"
        flat
        round
        @click.prevent.stop="exploreTree"
        :class="data.exploreStatus ? 'rot' : ''"
        :color="updated ? 'blue-9' : ''"
      >
        <q-icon name="mdi-cog-play" />
        <q-tooltip
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 0]"
          :delay="1000"
        >
          Обследование данного кольца
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="updated && Object.keys(badRels).length > 0"
        size="0.7em"
        round
        flat
        color="orange-9"
        @click.prevent.stop="
          () => {
            show.graph = true
          }
        "
      >
        <q-icon name="mdi-alert-decagram"></q-icon>
        <q-tooltip
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 0]"
          :delay="1000"
        >
          Есть неподтвержденные связи
        </q-tooltip>
      </q-btn>
    </div>
    <div v-if="data.showContent" class="circle-content">
      <e-tree-content :tree="tree.tree" :redraw="data" />
    </div>
  </div>
</template>

<style>
/* .tree-content {
  padding: 1px 0 1px 0;
  background-color: rgb(231, 231, 231);
  margin-left: -10px;
} */
.circle-main {
  padding: 0px 20px;
}
.circle {
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 30em;
}
.c-info {
  display: flex;
  margin-left: 10px;
  flex-grow: 1;
  margin-right: 10px;
  /* font-weight: bolder; */
  /* width: 50px;
  text-align: center; */
}
.c-info > * {
  margin-left: 2px;
}
/* .circle-error {
  justify-self: flex-end;
} */
.problem {
  background-color: white;
  color: black;
}
.c-label {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5em;
  color: white;
  margin-right: 3px;
  min-width: 70px;
  height: 32px;
}
.c-label::after {
  position: absolute;
  content: '';
  right: -32px;
  top: 0;
  width: 0;
  height: 0;
  border: solid 16px transparent;
  border-left: solid 16px #424242;
}
.c-label::before {
  position: absolute;
  content: '';
  right: -35px;
  top: 0;
  width: 0;
  height: 0;
  border: solid 16px transparent;
  border-left: solid 16px white;
}
.c-type {
  /* display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px; */
  /* background-color: white; */
  width: 10px;
  height: 2em;
  margin-right: 2px;
  /* color: black; */
}
.c-id {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}
.c-port {
  display: flex;
  align-items: center;
  height: 2em;
  padding: 0.5em;
  margin-right: 10px;
}
</style>
