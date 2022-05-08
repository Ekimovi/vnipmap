<script setup>
import { computed } from '@vue/reactivity'
import { conf } from '../conf'

const { node } = defineProps(['node'])
const url = computed(() => {
  const find = node.s_locate.match(/\d+/)
  const number = find ? `%20подъезд%20${find[0]}` : ''
  const url =
    'https://2gis.ru/ekaterinburg/search/' +
    node.s_address.replace('/', '%2F') +
    number
  return url
})
const cards = computed(() => {
  return [
    {
      title: 'Местоположение',
      icon: 'mdi-map-marker',
      list: [`${node.city}, ${node.s_address}`, node.s_locate],
      click: true,
    },
  ]
})
const openUrl = () => {
  window.open(url.value, '_blank').focus()
}
</script>

<template>
  <div class="e-cards">
    <div v-for="(card, i) in cards" :key="i" class="e-card">
      <div class="tit">
        <q-icon :name="card.icon" />
        <div style="margin-left: 5px">{{ card.title }}</div>
        <q-space />
        <img
          @click="openUrl"
          style="cursor: pointer"
          v-if="i == 0"
          width="40"
          height="15"
          alt="2GIS logo"
          :src="conf.loc + '/nipmap/images/2GIS_logo.svg.png'"
        />
      </div>
      <ul>
        <li v-for="(item, i) in card.list" :key="i">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style>
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
  /* margin-bottom: 10px; */
  color: #424242;
  background-color: white;
}
.tit {
  display: flex;
  font-weight: bold;
  align-items: center;
}
</style>
