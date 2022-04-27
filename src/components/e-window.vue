<script setup>
import { ref, reactive, watch } from 'vue'
import EToolbar from './e-toolbar.vue'

defineProps(['name', 'icon', 'color', 'close', 'buttons'])
const a = 1, b = 3
defineExpose({ a, b })
</script>

<template>
  <div class="window">
    <div :class="`w-header ${color}`">
      <q-space />
      <q-space />
      <span>{{ name }}</span>
      <q-space />
      <slot name="header"></slot>
      <q-space />
      <!-- <q-btn round color="white" v-if="config"> -->
      <!--   <q-icon name="mdi-cog" @click="config"></q-icon> -->
      <!-- </q-btn> -->
      <q-btn round>
        <q-icon size="1.5em" :name="icon" @click="close" />
      </q-btn>
    </div>
    <div :class="color">
      <e-toolbar :buttons="buttons" />
    </div>
    <div class="w-content">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
.window {
  position: relative;
  /* height: 100vh; */
  min-width: 20em;
  background-color: white;
  /* width: 400px; */
  display: flex;
  flex-direction: column;
  border-radius: 0.5em;
  overflow: hidden;
  font-size: 0.9em;
  min-width: 32em;
  margin-right: 0.2em;
  /* overflow: hidden; */
}
.w-header {
  display: flex;
  overflow: hidden;
  align-items: center;
  height: 2em;
  /* border-bottom: thin solid rgb(184, 184, 184); */
  padding-left: 30px;
  /* background-color: rgb(74, 74, 75); */
  color: white;
  /* overflow: hidden; */
  flex-shrink: 0;
}
.w-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 3px;
  height: 34px;
  flex-shrink: 0;
  /* background-color: rgb(241, 241, 241); */
}
.w-content {
  /* height: calc(100% - 56px); */
  position: relative;
  overflow-y: auto;
  overflow-x: hidden !important;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* flex-shrink: 1; */
  /* flex: 1 3 200px; */
  /* padding-left: 20px; */
}
.end-space {
  min-height: 45px;
}
</style>
