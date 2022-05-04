<template>
  <div>
    <div class="e-cards">
      <div v-for="(card, i) in cards" :key="i" class="e-card">
        <div class="tit">
          <v-icon>{{ card.icon }}</v-icon>
          <div style="margin-left: 5px">{{ card.title }}</div>
        </div>
        <ul>
          <li v-for="(item, i) in card.list" :key="i">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
    <div v-if="time" class="time green lighten-5 green--text text--darken-4">
      <div class="now green darken-3 white--text text--darken-4">
        {{ time.now }}
      </div>
      <div class="start">{{ time.startTime }}</div>
      <div class="pass">{{ time.passTime }}</div>
    </div>
    <v-btn v-if="!inTreeAdd" icon @click="getNodeUpdate"
      ><v-icon>mdi-update</v-icon></v-btn
    >
    <e-node-ports :node="node" />
  </div>
</template>

<script>
import { msToTime } from '../api/parser'
import ENodePorts from './e-node-ports.vue'
export default {
  components: { ENodePorts },
  mounted() {},
  created() {},
  props: {
    node: Object,
    inTreeAdd: Boolean,
  },
  data: () => ({}),
  computed: {
    cards() {
      return [
        {
          title: 'Сетевые реквизиты',
          icon: this.nodeIcon,
          list: [
            `IP-address: ${this.node.s__ip}`,
            'Mask: ' + this.node.sw_mask,
            `Gateway: ${this.node.sw_gw}`,
          ],
        },
        {
          title: "Vlan'ы",
          icon: this.nodeIcon,
          list: [
            `Управления: ${this.node.sw_mngt}`,
            'Абонентский: ' + this.vlan_abon,
            `Все: ${this.vlan_all}`,
          ],
        },
      ]
    },
    nodeIcon() {
      switch (this.node.type) {
        case 1:
          return 'mdi-hexagon-slice-6'
        case 0:
          return 'mdi-nut'
        default:
          return 'mdi-help-circle-outline'
      }
    },
    time() {
      if (this.node.startTime) {
        const now = new Date()
        const startTime = new Date(this.node.startTime)
        const passTime = msToTime(now - startTime)
        return {
          startTime: startTime.toLocaleString(),
          passTime,
          now: now.toLocaleString(),
        }
      }
    },
    vlan_abon() {
      if (this.node.ports.length > 0) {
        const pvidVlans = this.node.ports.reduce((pvidVlans, port) => {
          const pvid = port.cP_pvid
          if (port.cP_pvid in pvidVlans) pvidVlans[pvid]++
          else pvidVlans[pvid] = 1
          return pvidVlans
        }, {})
        return Object.keys(pvidVlans).reduce((a, b) =>
          pvidVlans[a] > pvidVlans[b] ? a : b
        )
      }
      // return ''
    },
    vlan_all() {
      const getVlansArray = (vlans) => {
        const result = []
        if(vlans) vlans.split(',').forEach((vlan) => {
          if (vlan && vlan != 0) {
            let splitRange = vlan.split('-')
            if (splitRange.length > 1)
              splitRange = [
                ...Array(splitRange[1] - splitRange[0] + 1).keys(),
              ].map((i) => i + Number(splitRange[0]))
            else splitRange[0] = Number(splitRange[0])
            result.push(...splitRange)
          }
        })
        return result
      }
      if (!this.node.ports) return ''
      const allVlans = []
      this.node.ports.forEach((p) => {
        const untag = getVlansArray(p.cP_untag)
        const tag = getVlansArray(p.cP_tag)
        allVlans.push(...untag)
        allVlans.push(...tag)
      })
      const allVlansSet = new Set(allVlans)
      return [...allVlansSet].sort((a, b) => a - b).join(',')
    },
  },
  watch: {},
  methods: {
    getNodeLldp() {
      this.$store.dispatch('getNodeLldp', this.node)
    },
    getNodeUpdate() {
      this.$store.dispatch('getNodeUpdate', this.node)
    },
    // setMark() {
    //   this.$store.dispatch('getGeoJson', this.node)
    // }
    // openUrl() {
    //   window.open(this.url, '_blank').focus()
    // }
  },
}
</script>

<style scoped>
.e-cards {
  display: flex;
  width: 710px;
  flex-wrap: wrap;
  padding: 5px;
}
.e-card {
  width: 330px;
  padding: 5px;
  margin: 5px;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  /* margin-bottom: 10px; */
  color: #424242;
  background-color: white;
}
.tit {
  display: flex;
  font-weight: bold;
}
li {
  width: 100%;
  /* hyphens: auto; */
  word-break: break-all;
  /* text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap; */
}
.time {
  display: flex;
  margin-left: 10px;
  justify-content: space-around;
  border-radius: 5px;
  overflow: hidden;
}
.time > div {
  width: 100%;
  text-align: center;
}
.time > .start {
  /* margin-right: 40px; */
}
</style>