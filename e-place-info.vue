<template>
  <div class="e-cards">
    <div v-for="(card, i) in cards" :key="i" class="e-card">
      <div class="tit">
        <v-icon>{{ card.icon }}</v-icon>
        <div style="margin-left: 5px">{{ card.title }}</div>
        <v-spacer />
        <img
          @click="openUrl()"
          style="cursor: pointer"
          v-if="i == 0"
          width="40"
          height="15"
          alt="2GIS logo"
          :src="$store.state.loc + '/images/2GIS_logo.svg.png'"
        />
      </div>
      <ul>
        <li v-for="(item, i) in card.list" :key="i">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  mounted() {},
  created() {},
  props: {
    node: Object,
  },
  data: () => ({}),
  computed: {
    url() {
      const find = this.node.s_locate.match(/\d+/)
      const number = find ? `%20подъезд%20${find[0]}` : ''
      const url =
        'https://2gis.ru/ekaterinburg/search/' +
        this.node.s_address.replace('/', '%2F') +
        number
      return url
    },
    cards() {
      return [
        {
          title: 'Местоположение',
          icon: 'mdi-map-marker',
          list: [
            `${this.node.city}, ${this.node.s_address}`,
            this.node.s_locate,
          ],
          click: true,
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
    },
  },
  watch: {},
  methods: {
    // setMark() {
    //   this.$store.dispatch('getGeoJson', this.node)
    // }
    openUrl() {
      window.open(this.url, '_blank').focus()
    },
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
</style>
