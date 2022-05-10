<template>
  <q-carousel
    v-model="slide"
    transition-prev="slide-right"
    transition-next="slide-left"
    swipeable
    animated
    control-color="grey-9"
    navigation
    padding
    arrows
    infinite
    class="bg-transparent shadow-0 rounded-borders my-card"
  >
    <q-carousel-slide name="dashboard" class="column no-wrap flex-center">
      <q-icon name="dashboard" size="3em" />
      <div class="q-mt-md text-center txt">
        Данную панель можно всегда вызвать не только нажатием кнопки внизу
        экрана, но и нажатием на клавиатуре сочетания клавиш ALT+M
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="search3" class="column no-wrap flex-center">
      <q-icon name="search" size="3em" />
      <div class="q-mt-md text-center txt">
        Для поиска объекта не обзятельно открывать главное меню, можно просто
        начать набор поискового запроса, меню октроется автоматически
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="search1" class="column no-wrap flex-center">
      <q-icon name="search" size="3em" />
      <div class="q-mt-md text-center txt">
        Поиск можно осуществлять не только по адресу размещения объекта, но и по
        его NIOSS-коду, IP-адресу (приложение автоматически определит критерий
        поиска)
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="search2" class="column no-wrap flex-center">
      <q-icon name="search" size="3em" />
      <div class="q-mt-md text-center txt">
        При ошибочном вводе в поле поиска адреса в английской раскладке,
        приложение автоматичнски заменит буквы на соответствующие в русской
        раскладке
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="search4" class="column no-wrap flex-center">
      <q-icon name="search" size="3em" />
      <div class="q-mt-md text-center txt">
        Выбрать нужный объект из резултатов поиска можно как мышкой, так и
        используя клавиши Вверх, Вниз (или ALT+K, ALT+J). Подтвердить выбор
        можно нажав Enter.
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="history" class="column no-wrap flex-center">
      <q-icon name="mdi-history" size="3em" />
      <div class="q-mt-md text-center txt">
        В левой части основного меню теперь отображается история поиска
        (последние 15 объектов)
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="graph" class="column no-wrap flex-center">
      <q-icon name="mdi-graph" size="3em" />
      <div class="q-mt-md text-center txt">
        После обследования кольца в панели Граф на неподтвержденных связях
        появляется кнопка, позволяющая удалить неактуальные связи.
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="snmp1" class="column no-wrap flex-center">
      <q-icon name="mdi-update" size="3em" />
      <div class="q-mt-md text-center txt">
        При опросе коммутатора (кнопка <q-icon name="mdi-update" /> в верхней
        части панели Оборудование) теперь опрашиваются так-же SFP-модули, при
        наличии модуля в порту, правее номера порта появляется соответствующая
        иконка <q-icon name="mdi-equalizer" />, при наведении на которую
        выводится результат опроса
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup>
import { ref } from 'vue'

const slide = ref('dashboard')
</script>

<style lang="scss" scoped>
.my-card {
  position: absolute !important;
  /* right: 20px; */
  top: 0px;
  max-width: 40em;
  max-height: 20em;
  /* left: 0 !important; */
  /* font-size: 3em; */
  /* font-weight: bold; */
  /* height: auto; */
  /* width: auto; */
  /* top: auto !important;
  left: auto !important; */
  /* text-align: center; */
}
.txt {
  //   font-size: 1.2em;
}
</style>
