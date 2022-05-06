<script setup>
import { computed } from '@vue/reactivity'
import { msToTime } from '../api/parser'

const { node } = defineProps(['node'])
const cards = computed(() => {
  return [
    {
      title: 'Сетевые реквизиты',
      icon: nodeIcon.value,
      list: [
        `IP-address: ${node.s__ip}`,
        'Mask: ' + node.sw_mask,
        `Gateway: ${node.sw_gw}`,
      ],
    },
    {
      title: "Vlan'ы",
      icon: nodeIcon.value,
      list: [
        `Управления: ${node.sw_mngt}`,
        'Абонентский: ' + vlan_abon.value,
        `Все: ${vlan_all.value}`,
      ],
    },
  ]
})
const nodeIcon = computed(() => {
  switch (node.type) {
    case 1:
      return 'mdi-hexagon-slice-6'
    case 0:
      return 'mdi-nut'
    default:
      return 'mdi-help-circle-outline'
  }
})
const vlan_abon = computed(() => {
  if (node.ports && node.ports.length > 0) {
    const pvidVlans = node.ports.reduce((pvidVlans, port) => {
      const pvid = port.cP_pvid
      if (port.cP_pvid && port.cP_pvid in pvidVlans) pvidVlans[pvid]++
      else pvidVlans[pvid] = 1
      return pvidVlans
    }, {})
    return Object.keys(pvidVlans).reduce((a, b) =>
      pvidVlans[a] > pvidVlans[b] ? a : b
    )
  }
})
const vlan_all = computed(() => {
  const getVlansArray = (vlans) => {
    const result = []
    if (vlans)
      vlans.split(',').forEach((vlan) => {
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
  if (!node.ports) return ''
  const allVlans = []
  node.ports.forEach((p) => {
    const untag = getVlansArray(p.cP_untag)
    const tag = getVlansArray(p.cP_tag)
    allVlans.push(...untag)
    allVlans.push(...tag)
  })
  const allVlansSet = new Set(allVlans)
  return [...allVlansSet].sort((a, b) => a - b).join(',')
})
</script>

<template>
  <div>
    <div class="e-cards">
      <div v-for="(card, i) in cards" :key="i" class="e-card shadow-1">
        <div class="tit">
          <q-icon :name="card.icon" />
          <div style="margin-left: 5px">{{ card.title }}</div>
        </div>
        <ul>
          <li v-for="(item, i) in card.list" :key="i">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
