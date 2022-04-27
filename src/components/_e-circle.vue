<script setup>
import {reactive, computed} from 'vue'
import ETreeContent from './e-tree-content.vue'
import ETreeContentExt from './e-tree-content-ext.vue'
import EEditTree from './e-edit-tree.vue'
/* import SNMP from '../api/snmp' */

const  props:= defineProps([
    'tree',
    'ext' ,
    'showContent' 
  ])
const data = reactive({
  pingClickStatus: false,
    exploreStatus: false,
    updated: false,
    editTree: false
})  
  computed: {
    duNodes() {
      const res = []
      for (const nId of this.tree.treeNodes) {
        const node = this.$store.state.nodes[nId]
        if (node.type != 1) res.push(node)
      }
      return res
    },
    circles() {
      const res = this.duNodes.reduce((p, n) => {
        if (n.c_id in p) p[n.c_id].count++
        else p[n.c_id] = { c_id: n.c_id, c_type: n.c_type, count: 1 }
        return p
      }, {})
      return res
    },
    maxCountCid() {
      const notNull = Object.values(this.circles).filter((c) => c.c_id != null)
      if (notNull.length > 0)
        return notNull.sort((a, b) => a.count - b.count)[0]
      return null
    },
    cId() {
      if (this.maxCountCid) return this.maxCountCid.c_id
      return null
    },
    realCType() {
      const fNode = this.tree.tree[0].node
      const sNode = this.tree.tree[this.tree.tree.length - 1].node
      if (sNode.type != 1) return { c_type: 0, ma_id: fNode.s_id, mb_id: null }
      if (fNode.s_id == sNode.s_id)
        return { c_type: 1, ma_id: fNode.s_id, mb_id: fNode.s_id }
      return { c_type: 2, ma_id: fNode.s_id, mb_id: sNode.s_id }
    },
    needIndex() {
      const r = !!(
        Object.keys(this.circles).length > 1 ||
        'null' in this.circles ||
        this.maxCountCid.c_type != this.realCType.c_type
      )
      return r
    },
    badRels() {
      let relsNodes = []
      this.duNodes.forEach((node) => {
        relsNodes.push(...this.$store.state.graph.graph[node.s_id])
      })
      const badRels = relsNodes.reduce((p, rn) => {
        if (!(rn.rel.source == 'correct' || rn.rel.source == 'lldp'))
          p[rn.rel.id] = rn.rel
        return p
      }, {})
      return badRels
    },
    pingStatus() {
      for (let id of this.tree.treeNodes) {
        if (this.$store.state.nodes[id].ping) return true
      }
      return false
    },
    countNodes() {
      return this.tree.treeNodes.size
    },
    countDieNodes() {
      let c = 0
      for (let id of this.tree.treeNodes) {
        const node = this.$store.state.nodes[id]
        if (node.s_monitor == 0 && node.s_state == 'DIE') c++
      }
      return c
    },
    gEvent() {
      return this.$store.state.gEvent
    },
    cColor() {
      const styles = {
        0: 'grey lighten-2',
        1: 'orange darken-2',
        2: 'green darken-2',
      }
      return styles[this.realCType.c_type]
    },
  },
  watch: {
    pingStatus(val) {
      if (!val) {
        this.pingClickStatus = false
        if (this.exploreStatus) this.getLldp()
      }
    },
  },
  created() {},
  mounted() {},
  methods: {
    async exploreTree() {
      this.exploreStatus = true
      // this.pingTree()
      const filterNodesIdForLldp = () => {
        const filteredNodesIdSet = new Set()
        for (let id of this.tree.treeNodes) {
          const node = this.$store.state.nodes[id]
          if (node.s_monitor == 0 && node.s_state == 'LIFE' && node.type != 1)
            filteredNodesIdSet.add(id)
        }
        return filteredNodesIdSet
      }
      await this.snmp.getLldp(filterNodesIdForLldp(this.tree.treeNodes))
      this.$store.commit('setGraph', this.$store.state.relsNodes)
      this.exploreStatus = false
      this.updated = true
    },
    pingTree() {
      this.pingClickStatus = true
      for (let id of this.tree.treeNodes) {
        const nod = this.$store.state.nodes[id]
        if (nod.s_monitor == 0) this.pingNode(nod)
      }
    },
    pingNode(node) {
      if (!node.ping) {
        this.$store.dispatch('pingNode', node)
      }
    },
  },
}
</script>

<template>
  <div class="circle-main">
    <div class="circle" @click="$emit('expandCircle', tree.treeId)">
      <div class="c-type" :class="cColor"></div>
      <div class="c-label grey darken-3">
        <div class="c-id">
          {{ cId || '?' }}
        </div>
      </div>
      <div class="grey darken-2 white--text c-port">{{ tree.circlePort }}</div>
      <v-chip color="blue darken-4" label outlined> {{ countNodes }}</v-chip>
      <v-chip
        v-if="countDieNodes"
        color="red darken-4"
        text-color="white"
        label
        >{{ countDieNodes }}</v-chip
      >
      <v-spacer />
      <!-- <v-tooltip right color="orange darken-4">
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            :color="tree.statistics.broken ? 'red' : 'orange'"
            v-if="tree.statistics.sub || tree.statistics.broken"
            >mdi-alert-decagram</v-icon
          >
        </template>
        <div v-if="tree.statistics.sub">
          Расщепление кольца: {{ tree.statistics.sub }}
        </div>
        <div v-if="tree.statistics.broken">Разрыв кольца</div>
      </v-tooltip> -->
      <v-tooltip bottom open-delay="2000">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            @click.prevent.stop="pingTree"
            :class="pingClickStatus && pingStatus ? 'rot' : ''"
          >
            <v-icon> mdi-swap-horizontal </v-icon>
          </v-btn>
        </template>
        Пинг данного кольца
      </v-tooltip>
      <v-tooltip bottom open-delay="2000">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            @click.prevent.stop="exploreTree"
            :class="exploreStatus ? 'rot' : ''"
            :color="updated ? 'blue darken-4' : ''"
          >
            <v-icon> mdi-cog-play </v-icon>
          </v-btn>
        </template>
        Обследование данного кольца
      </v-tooltip>
      <v-tooltip
        v-if="updated && (needIndex || Object.keys(badRels).length > 0)"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click.prevent.stop="editTree = !editTree">
            <v-icon color="orange darken-3j">mdi-alert-decagram </v-icon>
          </v-btn>
        </template>
        Редактирование кольца
      </v-tooltip>
    </div>
    <e-edit-tree
      v-if="editTree"
      :tree="tree"
      :badRels="badRels"
      :needIndex="needIndex"
      :circles="circles"
      :cId="cId"
      :realCType="realCType"
      :duNodes="duNodes"
      @showEditTree="editTree = false"
    />
    <div v-show="showContent" class="circle-content">
      <e-tree-content-ext
        v-if="ext"
        :tree="tree.tree"
        :updated="updated"
        style="margin-left: 10px"
      />
      <e-tree-content v-if="!ext" :tree="tree.tree" />
    </div>
  </div>
</template>
<style >
/* .tree-content {
  padding: 1px 0 1px 0;
  background-color: rgb(231, 231, 231);
  margin-left: -10px;
} */
.circle-main {
  padding: 5px 20px;
}
.circle {
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 500px;
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
  padding: 0px 0 0 10px;
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
  height: 32px;
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
  height: 32px;
  padding: 0 10px 0 25px;
  margin-right: 10px;
}
</style>
