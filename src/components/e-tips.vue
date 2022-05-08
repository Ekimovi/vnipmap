<template>
  <q-carousel
    v-model="slide"
    transition-prev="scale"
    transition-next="scale"
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
        экрана, но и нажатием на клавиатуре сочетания клавиш CTRL+M
      </div>
    </q-carousel-slide>
    <q-carousel-slide name="history" class="column no-wrap flex-center">
      <q-icon name="mdi-history" size="3em" />
      <div class="q-mt-md text-center txt">
        В левой части основного меню теперь отображается история поиска
        (последние 15 объектов)
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
