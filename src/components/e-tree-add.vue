<template>
  <e-window
    v-if="node && $store.state.show.tree"
    :name="name"
    :icon="icon"
    cName="treeAdd"
    headerColor="blue darken-3"
    style="flex-shrink: 0"
  >
    <template v-slot:header> </template>
    <template v-slot:toolbar>
      <e-toolbar
        :options="{ btnType: 'icon', position: 'bottom' }"
        :buttons="buttons"
      />
      <v-progress-linear
        v-if="progress"
        height="5"
        color="blue lighten-1"
        class="fix"
        indeterminate
      />
    </template>
    <template v-slot:content>
      <div class="address">
        <div>
          <div>{{ node.s_address }}</div>
          <div class="grey--text text--darken-4" style="font-weight: normal">
            {{ node.city }}
          </div>
        </div>
      </div>
      <e-node-new
        :relNode="{ node }"
        :inTreeAdd="true"
        style="margin-right: 20px"
      />
    </template>
  </e-window>
</template>

<script>
import EWindow from './e-window.vue'
import EToolbar from './e-toolbar.vue'
import ENodeNew from './e-node-new.vue'
import SNMP from '../api/snmp'

export default {
  name: 'e-tree-add',
  components: {
    EWindow,
    EToolbar,
    ENodeNew,
  },
  props: {},
  data: () => ({
    cName: 'treeAdd',
    name: 'Обзор коммутатора',
    icon: 'mdi-arrow-decision',
    progress: false,
  }),
  created() {},
  mounted() {},
  computed: {
    id() {
      return this.$store.state.activeObjectId
    },
    node() {
      this.$store.state.graph
      return this.$store.state.nodes[this.id]
    },
    buttons() {
      return [
        {
          icon: 'mdi-update',
          tooltip: 'Опросить коммутатор',
          dark: true,
          disabled: false,
          click: async () => {
            this.progress = true
            await this.$store.dispatch('getNodeUpdate', this.node)
            this.progress = false
          },
          color: 'white',
        },
        {
          icon: 'mdi-cog-play',
          tooltip: 'Опросить по LLDP',
          dark: true,
          disabled: false,
          click: async () => {
            this.progress = true
            const snmp = SNMP(this.$store)
            await snmp.getLldp(new Set([this.node.s_id]), false)
            this.$store.commit('setGraph', this.$store.state.relsNodes)
            this.progress = false
          },
          color: 'white',
        },
        // {
        //   icon: 'mdi-share-variant',
        //   tooltip: 'Скопировать ссылку на активный объект',
        //   dark: true,
        //   disabled: false,
        //   click: () => {
        //     const href = `${
        //       window.location.origin + window.location.pathname
        //     }/?activeObjectId=${this.selectedNode} `
        //     navigator.clipboard
        //       .writeText(href)
        //       .then(() => {
        //         this.$store.commit('addAlert', {
        //           type: 'info',
        //           text: 'Ссылка на текущий объект добавлена в буфер обмена',
        //         })
        //       })
        //       .catch((err) => {
        //         console.log('Something went wrong', err)
        //       })
        //   },
        //   color: 'white',
        // },
        // {
        //   icon: !this.expand ? 'mdi-chevron-down' : 'mdi-chevron-up',
        //   tooltip: !this.expand ? 'Развернуть всё' : 'Свернуть всё',
        //   dark: true,
        //   disabled: false,
        //   click: () => {
        //     this.expand = !this.expand
        //   },
        //   color: 'white',
        // },
      ]
    },
  },
  watch: {},
  methods: {},
}
</script>

<style scoped>
.address {
  width: 100%;
  /* background-color: #1976d2; */
  /* padding-left: 15px; */
  padding-right: 15px;
  padding-left: 20px;
  padding-bottom: 5px;
  /* cursor: pointer; */
}
.address > div {
  color: #0d47a1;
  padding: 20px 0 0 0;
  /* border-radius: 5px; */
  border-bottom: 2px solid #0d47a1;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* justify-content: center; */
  font-weight: bold;
}
.fix {
  position: absolute;
  top: 0px;
}
</style>