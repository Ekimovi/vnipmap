<template>
  <div>
    <div
      class="tit"
      v-if="Object.keys(badRels).length || undoDel.length"
      @click="showBadRels = !showBadRels"
    >
      <v-icon color="orange darken-4" style="margin-right: 10px"
        >mdi-image-broken-variant
      </v-icon>
      Неактивные связи
      <div class="count orange darken-4 white--text">
        {{ Object.keys(badRels).length }}
      </div>
      <v-spacer />
      <v-icon>{{
        !showBadRels ? 'mdi-chevron-down' : 'mdi-chevron-up'
      }}</v-icon>
    </div>
    <div v-show="showBadRels">
      <div v-for="(br, key) in badRels" class="str" :key="key">
        <v-checkbox v-model="selectedRels" :value="key" color="red darken-2" />
        <e-node :node="$store.state.nodes[br.a_id]" style="width: 350px" />
        <div class="rel red darken-2"></div>
        <e-node :node="$store.state.nodes[br.b_id]" style="width: 350px" />
      </div>
      <div class="str" style="margin: 5px">
        <v-spacer />
        <v-btn
          style="margin-right: 5px"
          :disabled="!undoDel.length"
          @click="undoDelRels"
          class="green darken-2 white--text"
          ><v-icon>mdi-arrow-u-left-top-bold</v-icon></v-btn
        >
        <v-btn
          :disabled="!selectedRels.length"
          @click="delSelectedRels"
          class="red darken-2 white--text"
          >Удалить</v-btn
        >
      </div>
    </div>
    <div
      class="tit"
      v-if="needIndex"
      @click="showCircleIndex = !showCircleIndex"
    >
      <v-icon color="orange darken-4" style="margin-right: 10px"
        >mdi-format-indent-increase</v-icon
      >
      Индексирование кольца
      <v-spacer />
      <v-icon>{{
        !showCircleIndex ? 'mdi-chevron-down' : 'mdi-chevron-up'
      }}</v-icon>
    </div>
    <div v-show="showCircleIndex">
      <div
        v-for="(ci, key) in circles"
        class="str"
        style="margin-bottom: 5px"
        :key="key"
      >
        <!-- <div class="c-type" :class="cColor"></div> -->
        <div class="c-label grey darken-3">
          <div class="c-id">
            {{ ci.c_id || '?' }}
          </div>
        </div>
        <v-chip color="blue darken-4" style="margin-left: 25px" label outlined>
          {{ ci.count }}</v-chip
        >
        <v-icon style="margin: 0 20px" color="orange darken-4"
          >mdi-arrow-right-circle</v-icon
        >
        <div>{{ action(ci) }}</div>
      </div>
    </div>
    <div class="str">
      <v-spacer />
      <v-btn
        @click="saveCircle"
        :disabled="!(needIndex || undoDel.length > 0)"
        class="orange darken-2 white--text"
        >Сохранить изменения</v-btn
      >
    </div>
  </div>
</template>

<script>
import ENode from './e-node.vue'
export default {
  data: () => ({
    selectedRels: [],
    undoDel: [],
    showBadRels: false,
    showCircleIndex: false,
    query: {},
  }),
  props: {
    tree: {},
    badRels: {},
    needIndex: false,
    circles: {},
    cId: null,
    realCType: 0,
    duNodes: [],
  },
  components: {
    ENode,
  },
  created() {},
  computed: {},
  methods: {
    action(ci) {
      if (this.cId) {
        if (ci.c_id == this.cId) {
          if (ci.c_type != this.realCType) return 'Будет изменен тип кольца'
          return 'Без изменений'
        }
        return `Будет присвоен идекс ${this.cId}`
      }
      return 'Будет присвоен новый индекс'
    },
    delSelectedRels() {
      const sel = new Set(this.selectedRels)
      this.undoDel.push(
        this.$store.state.relsNodes.rels.filter((r) => sel.has(r.id + ''))
      )
      this.$store.commit('delRels', sel)
      this.selectedRels = []
    },
    undoDelRels() {
      const undoRels = this.undoDel.pop()
      this.$store.commit('addRels', undoRels)
    },
    async saveCircle() {
      if (this.undoDel.length > 0)
        this.query.delRel = this.undoDel
          .reduce((r, e) => {
            r.push(...e)
            return r
          }, [])
          .map((e) => {
            return e.id
          })
      if (this.needIndex)
        this.query.index = {
          c_id: this.cId,
          ...this.realCType,
          nodes: this.duNodes.map((n) => {
            return n.s_id
          }),
        }
      const newCid = await this.$store.dispatch('saveCircle', this.query)
      if (newCid.c_id)
        this.duNodes.forEach((n) => {
          n.c_id = newCid.c_id
          n.c_type = this.realCType.c_type
        })
      this.$emit('showEditTree')
    },
  },
}
</script>

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
}
.rel {
  width: 10px;
  height: 10px;
  border-radius: 5px;
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