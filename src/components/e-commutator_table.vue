<script setup>
import { ref, reactive, onMounted, watch, computed, onUpdated } from 'vue'
import { activeNodeId, nodes, getPorts } from '../stores/nodes'
import { show } from '../stores/show'
import EWindow from './e-window.vue'
import ENode from './e-node.vue'
import EPlaceInfo from './e-place-info.vue'
import ENodeInfo from './e-node-info.vue'

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
const columns = [
  {
    name: 'p_num',
    label: '#',
    align: 'center',
    field: 'p_num',
  },
  {
    name: 'p_speed',
    label: 'S',
    align: 'center',
    field: 'p_speed',
  },
  {
    name: 'p_vlan',
    label: 'Vlan',
    align: 'center',
    field: 'p_vlan',
  },
  {
    name: 'p_desc',
    label: 'Описание',
    align: 'center',
    field: 'p_desc',
  },
  {
    name: 'p_in',
    label: 'In',
    align: 'center',
    field: 'p_in',
  },
  {
    name: 'p_in_error',
    label: 'In error',
    align: 'center',
    field: 'p_in_error',
  },
  {
    name: 'p_out',
    label: 'Out',
    align: 'center',
    field: 'p_out',
  },
  {
    name: 'p_out_error',
    label: 'Out error',
    align: 'center',
    field: 'p_out_error',
  },
  {
    name: 'p_last',
    label: 'Last',
    align: 'center',
    field: 'p_Last',
  },
]
const node = computed(() => {
  return nodes[activeNodeId.value]
})
const rows = computed(() => {
  if (node.value) return node.value.ports
})
const visibleColumns = ref([
  'p_num',
  'p_vlan',
  'p_desc',
  'p_speed',
  'p_in',
  'p_in_error',
  'p_out',
  'p_out_error',
  'p_last',
])
const buttons = computed(() => [
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
])
const info = reactive({
  place: true,
  comm: true,
  node: true,
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
        <div style="width: 35em">
          <e-node
            :node="node"
            :address="true"
            :disableActive="true"
            :key="node.s_id"
          />
        </div>
        <div v-if="info.place || info.comm || info.node" class="e-info">
          <div class="info-cont">
            <e-place-info v-if="info.place" :node="node" :key="node.s_id" />
            <!-- <e-commutator-info v-if="info.comm" :node="node" :key="node.s_id" /> -->
            <e-node-info v-if="info.node" :node="node" :key="node.s_id" />
          </div>
        </div>
        <q-table
          title="Ports"
          :rows="rows"
          :columns="columns"
          row-key="name"
          :visible-columns="visibleColumns"
          :hide-pagination="true"
          :pagination="{ rowsPerPage: 0 }"
          style="margin-bottom: 5em"
        >
          <template v-slot:top>
            <q-space />
            <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              options-cover
              style="min-width: 150px"
            />
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-grey-8 text-white"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
        </q-table>
        <!-- <div class="space"></div> -->
      </div>
    </template>
  </e-window>
</template>

<style lang="scss" scoped>
.commutator {
  padding: 0.3em;
}
.space {
  height: 5em;
}
</style>
