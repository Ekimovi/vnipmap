<script setup>
import { ref, reactive, computed, onMounted, onUpdated, watch } from 'vue'
import ENode from './e-node.vue'
import ETreeContent from './e-tree-content.vue'
import { relColor } from '../stores/constant'
import { activeNodeId } from '../stores/nodes'

const data = reactive({
  showContent: [],
  showUpPorts: {},
})
const { tree, addressId, redraw, type, updated } = defineProps([
  'tree',
  'addressId',
  'updated',
  'redraw',
])

// watch(
//   () => redraw.showContent,
//   (val) => {
//     if (val) setTimeout(drawRels, 5)
//   }
// )

const treeSorted = computed(() => {
  if (addressId)
    return [
      ...tree.filter((rn) => rn.node.ad_id == addressId),
      ...tree.filter((rn) => rn.node.ad_id != addressId),
    ]
  return tree
})
const needAddress = (i) => {
  if (i == 0) {
    if (treeSorted.value[i].node.ad_id == addressId) return false
    return true
  }
  if (treeSorted.value[i].node.ad_id == treeSorted.value[i - 1].node.ad_id)
    return false
  return true
}

const container = ref(null)
const canvas = ref(null)
const nodeRefs = reactive([])
const canvasData = reactive({
  width: 100,
  height: 100,
})
const getRef = (ref) => {
  nodeRefs.push(ref)
}
const clickNode = (node) => {
  activeNodeId.value = node.s_id
}
onMounted(() => {
  drawRels()
})
onUpdated(() => {
  drawRels()
})
const drawRel = (ctx, ref, i) => {
  const y = ref.offsetTop
  const h = ref.offsetHeight
  const rel = treeSorted.value[i].rel || treeSorted.value[i + 1].rel
  const rColor = relColor[rel.source]
  ctx.strokeStyle = rColor
  ctx.lineWidth = 2
  ctx.moveTo(8, y + h / 2 - 1)
  ctx.lineTo(0, y + h / 2 - 1)
  if (treeSorted.value[i].rel) {
    ctx.moveTo(1, y + h / 2 - 1)
    if (i == 0) ctx.lineTo(1, 0)
    else {
      const refBefore = nodeRefs[i - 1].value
      const yBefore = refBefore.offsetTop + refBefore.offsetHeight / 2 + 1
      ctx.lineTo(1, yBefore)
    }
  }
  ctx.stroke()
}
const drawRels = () => {
  const ctx = canvas.value.getContext('2d')
  canvasData.width = container.value.offsetWidth
  canvasData.height = container.value.offsetHeight
  nodeRefs.forEach((ref, i) => {
    drawRel(ctx, ref.value, i)
  })
}
</script>

<template>
  <div v-if="tree" ref="container" style="position: relative">
    <canvas
      ref="canvas"
      :width="canvasData.width"
      :height="canvasData.height"
      class="canvas"
    />
    <div v-for="(relNode, i) in treeSorted" :key="relNode.node.s_id">
      <e-node
        :node="relNode.node"
        :address="needAddress(i)"
        @ref="getRef"
        @clickNode="clickNode"
      >
        <q-tooltip
          v-if="relNode.rel"
          anchor="top middle"
          self="center right"
          :offset="[0, 20]"
        >
          <div>
            {{
              relNode.rel.a_id == relNode.node.s_id
                ? relNode.rel.b_port
                : relNode.rel.a_port
            }}
          </div>
          <div>
            {{
              relNode.rel.a_id != relNode.node.s_id
                ? relNode.rel.b_port
                : relNode.rel.a_port
            }}
          </div>
        </q-tooltip>
      </e-node>
      <e-tree-content
        v-if="relNode.sub"
        :tree="relNode.sub"
        :sub="true"
        :address-id="relNode.node.ad_id"
        style="margin-left: 1.2em"
        :redraw="redraw"
      />
    </div>
  </div>
</template>

<style scoped>
.rel {
  position: absolute;
  top: 5px;
  left: 15px;
  width: 15px;
  height: 15px;
  border-radius: 20px;
  /* color: rgb(0, 219, 0) */
}
.address {
  width: 100%;
  /* background-color: #1976d2; */
  padding-left: 15px;
  padding-bottom: 5px;
  border-left: 4px solid;
  /* cursor: pointer; */
}
.address > div {
  color: #0d47a1;
  padding: 20px 0 0 0;
  /* border-radius: 5px; */
  border-bottom: 2px solid #0d47a1;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* justify-content: center; */
  font-weight: bold;
}
/* .tree-node {
  background-color: white;
  margin: 2px 0 2px 20px;
  border-radius: 5px;
} */
.canvas {
  position: absolute;
  left: 0;
  top: 0;
}
</style>
