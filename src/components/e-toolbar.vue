<script setup>
defineProps(['buttons'])

</script>

<template>
  <div class="e-toolbar">
    <template v-for="btn in buttons">
      <q-btn size="0.7em" flat round @click="btn.click">
        <q-icon :name="btn.icon" color="white" />
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{ btn.tooltip }}</q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<style scoped>
.e-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
