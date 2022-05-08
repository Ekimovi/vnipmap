<script setup>
import { computed } from 'vue'
const { node } = defineProps(['node'])
const cards = computed(() => {
  return [
    {
      title: 'Коммутатор',
      icon: 'mdi-barcode',
      list: [`MAC: ${node.s_mac}`, 'Nioss: ' + node.s_niossname],
    },
    // {
    //   title: 'Доступ (заглушка - данные не верны)',
    //   icon: 'mdi-bank-check',
    //   list: [
    //     'Свобоный/УК/Пердседатель',
    //     'УК Верх-Исетская',
    //     'ЖЭУ-1 (Московская 80)',
    //     'Открыт чердак в 2 подъезде'
    //   ]
    // },
    // {
    //   title: 'Ключи (заглушка - данные не верны)',
    //   icon: 'mdi-key',
    //   list: ['Белореченская 1а - 1/23', 'Универсал-3']
    // },
    // {
    //   title: 'Файлы (заглушка - данные не верны)',
    //   icon: 'mdi-library',
    //   list: ['Документы - 0', 'Фото/видио - 0']
    // }
  ]
})
</script>

<template>
  <div class="e-cards">
    <div v-for="(card, i) in cards" :key="i" class="e-card">
      <div class="tit">
        <q-icon :name="card.icon"></q-icon>
        <div style="margin-left: 5px">{{ card.title }}</div>
      </div>
      <ul>
        <li v-for="(item, i) in card.list" :key="i">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
