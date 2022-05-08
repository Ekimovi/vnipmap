<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import EWindow from './e-window.vue'
import * as d3 from 'd3'
import ENode from './e-node.vue'
import { show } from '../stores/show'
import {
  graph,
  graphRels,
  activeNodeId,
  nodes,
  force,
  delRels,
} from '../stores/nodes'
import { relColor } from '../stores/constant'

const svgdiv = ref(null)
// const allTrees = computed(() => graph.value.allTree)
// const activeObject = computed({
//   get() {
//     return activeNodeId.value ? nodes[activeNodeId.value] : undefined
//   },
//   set(node) {
//     activeNodeId.value = node.s_id
//   },
// })
const activeObject = computed(() => {
  return activeNodeId.value ? nodes[activeNodeId.value] : undefined
})
const label = ref(false)
const close = () => {
  show.graph = false
}
const data = reactive({
  name: 'Граф',
  icon: 'mdi-graph',
  width: 0,
  height: 0,
  showConfig: false,
  config: {
    colorMu: {
      name: 'Цвет МУ',
      type: 'color',
      value: '#1565C0',
    },
    sizeMu: {
      name: 'Рзмер МУ',
      type: 'num',
      value: 20,
      min: 1,
      max: 100,
      step: 1,
    },
    sizeDu: {
      name: 'Рзмер ДУ',
      type: 'num',
      value: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    groupColor: {
      name: 'Цвета ДУ',
      type: 'palette',
      value: [
        '#E65100',
        '#FFA726',
        '#FFEB3B',
        '#4CAF50',
        '#A5D6A7',
        '#2196F3',
        '#AB47BC',
        '#CE93D8',
        '#880E4F',
        '#F06292',
      ],
    },
  },
  hoverNode: null,
  hnPosition: {},
  transform: null,
  gs: null,
})
let drag = false

onMounted(() => {
  startD3()
  // const res = await this.$store.dispatch('getConfig', 'graph')
  // if (res) this.config = res
  // this.svgDiv = document.getElementById('svgdiv')
})
watch(
  () => graph.value,
  () => {
    startD3()
    // console.log('val', allTrees)
  }
)
// watch(
//   () => show.graph,
//   (val) => {
//     if (val) {
//     //   this.onResize()
//       startD3()
//     }
//   }
// )
const markActiveNode = () => {
  data.gs.selectAll('.active-node').remove()

  const ags = data.gs.filter((d) => {
    return d.s_id == activeNodeId.value
  })
  ags
    .insert('circle', 'circle')
    .attr('class', 'active-node')
    .attr('r', (d) => {
      d.fx = null
      d.fy = null
      if (d.s_id == activeNodeId.value) {
        if (d.type == 1) return sizeMu.value + 2
        else return sizeDu.value + 2
      }
    })
    .attr('fill', () => {
      return 'white'
    })
  ags
    .insert('circle', 'circle')
    .attr('class', 'active-node')
    .attr('r', (d) => {
      if (d.s_id == activeNodeId.value) {
        if (d.type == 1) return sizeMu.value + 10
        else return sizeDu.value + 10
      }
    })
    .attr('fill', () => {
      return '#90CAF9'
    })
}

watch(
  () => activeNodeId.value,
  (val) => {
    if (data.gs && val) markActiveNode()
  }
)
const sizeMu = computed({
  get() {
    return data.config.sizeMu.value
  },
  set(val) {
    data.config.sizeMu.value = val
    data.gs.selectAll('.mu').attr('r', val)
  },
})
const colorMu = computed({
  get() {
    return data.config.colorMu.value
  },
  set(val) {
    data.config.colorMu.value = val
    data.gs.selectAll('.mu').attr('fill', val)
  },
})
const sizeDu = computed({
  get() {
    return data.config.sizeDu.value
  },
  set(val) {
    data.config.sizeDu.value = val
    data.gs.selectAll('.du').attr('r', val)
  },
})
const groupColor = computed({
  get() {
    return data.config.groupColor.value
  },
  set(val) {
    data.config.groupColor.value = val
    data.config.groupColor = { ...data.config.groupColor }
    data.gs.selectAll('.du').attr('fill', (d) => val[d.group])
  },
})
const relss = computed(() => {
  let r = []
  if (graphRels.value) {
    graphRels.value.forEach((e) => {
      if (!(e.a_type && e.b_type)) {
        let a = nodes[e.a_id]
        let b = nodes[e.b_id]
        if (a && b)
          r.push({
            source: a,
            target: b,
            id: e.id,
            s: e.source,
            rel: e,
          })
      }
    })
  }
  return r
})
// const saveConfig = () => {
//   this.$store.dispatch('saveConfig', { key: 'graph', config: this.config })
// }
// const change = ({ key, value }) => {
//   this[key] = value
// }
const allLock = () => {
  for (const key in nodes.inUse.graph) {
    const n = nodes[key]
    n.fx = n.x
    n.fy = n.y
  }
}
const unLockAll = () => {
  for (const key in nodes.inUse.graph) {
    const n = nodes[key]
    n.fx = null
    n.fy = null
  }
}
const buttons = computed(() => [
  {
    icon: label.value ? 'mdi-label-off' : 'mdi-label',
    click: () => (label.value = !label.value),
    tooltip: label.value ? 'Серыть подписи' : 'Показать подписи',
    dark: false,
    color: 'white',
  },
  {
    icon: 'mdi-lock',
    click: allLock,
    tooltip: 'Закрепить все узлы',
    dark: false,
    color: 'white',
  },
  {
    icon: 'mdi-lock-off',
    click: unLockAll,
    tooltip: 'Открепить все узлы',
    dark: false,
    color: 'white',
  },
])
const onResize = () => {
  if (svgdiv) {
    data.width = svgdiv.value.offsetWidth
    data.height = svgdiv.value.offsetHeight
  }
}
const badRels = computed(() => {
  const bb = graphRels.value.reduce((bRels, rel) => {
    if (rel.updated && rel.source != 'correct' && rel.source != 'lldp')
      bRels[rel.id] = rel
    return bRels
  }, {})
  return bb
})
const startD3 = () => {
  onResize()
  d3.selectAll('svg > *').remove()
  let svg = d3.select('svg')
  let width = data.width
  let height = data.height
  let g = svg.append('g')
  g.attr('transform', data.transform)
  let _nodes = Object.values(nodes.inUse.graph)
  let edges = relss.value
  let forceSimulation = d3
    .forceSimulation()
    .force('link', d3.forceLink())
    .force('charge', d3.forceManyBody().strength(-10))
    .force('center', d3.forceCenter())
  forceSimulation.nodes(_nodes).on('tick', ticked)

  forceSimulation
    .force('link')
    .links(edges)
    .distance(function (e) {
      if (e.source.groupIndex == e.target.groupIndex) return 20
      return 40
    })
  forceSimulation
    .force('center')
    .x(width / 2.2)
    .y(height / 2.2)

  let links = g
    .append('g')
    .selectAll('line')
    .data(edges)
    .enter()
    .append('line')
    .attr('stroke', (d) => {
      if (d.rel.id in badRels.value) return relColor['ipmap']
      return relColor[d.s]
    })
    .attr('stroke-width', (d) => {
      if (d.s == 'correct') return 2
      else return 2
    })
  // let linkLabels = g
  //   .append('g')
  //   .selectAll('line')
  //   .data(edges)
  //   .enter()
  //   .append('text')
  //   // .attr({
  //   //   class: 'link-label',
  //   //   'text-anchor': 'middle',
  //   // })
  //   .text((d) => 'lsdkfjlksjdfl')
  // console.log(linkLabels)

  let gs = g
    .selectAll('.circleText')
    .data(_nodes)
    .enter()
    .append('g')
    .attr('transform', function (d) {
      let cirX = d.x
      let cirY = d.y
      return 'translate(' + cirX + ',' + cirY + ')'
    })
    .call(d3.drag().on('start', started).on('drag', dragged).on('end', ended))
  data.gs = gs

  markActiveNode()

  gs.append('circle')
    .attr('r', (d) => {
      if (d.type == 1) return sizeMu.value
      else return sizeDu.value
    })
    .attr('fill', (d) => {
      if (d.type == 1) return colorMu.value
      if (d.type == null && d.s_monitor != 1) return 'orange'
      if (d.s_monitor == 1) return 'lightgrey'
      else return groupColor.value[d.groupIndex]
    })
    .attr('class', (d) => {
      if (d.type == 1) return 'mu'
      else return 'du'
    })
  gs.on('mouseover', (e, n) => {
    if (drag || label.value) return
    data.hoverNode = n
    data.hnPosition = {
      left: e.pageX + 20 + 'px',
      top: e.pageY - 25 + 'px',
    }
  })
    .on('mousemove', (e, n) => {
      if (label.value) return
      if (!data.hoverNode) data.hoverNode = n
      data.hnPosition = {
        left: e.offsetX + 20 + 'px',
        top: e.offsetY - 25 + 'px',
      }
    })
    .on('mouseout', () => {
      data.hoverNode = null
    })
    .on('click', (e, n) => {
      if (e.ctrlKey) {
        force.value = true
      }
      activeNodeId.value = n.s_id
    })
    .on('contextmenu', (e) => {
      d.fx = null
      d.fy = null
      e.preventDefault()
    })
  const huawei = gs.filter((d) => d.m_model == 'Huawei S6330-H24X6C')
  huawei
    .append('text')
    .text('H')
    .attr('fill', 'white')
    .attr('x', -6)
    .attr('y', 6)
    .attr('cursor', 'default')
    .attr('font-weight', 'bold')
  function ticked() {
    links
      .attr('x1', function (d) {
        return d.source.x
      })
      .attr('y1', function (d) {
        return d.source.y
      })
      .attr('x2', function (d) {
        return d.target.x
      })
      .attr('y2', function (d) {
        return d.target.y
      })
    // linkLabels
    //   .attr('x', function (d) {
    //     return 10 + d.source.x - (d.source.x - d.target.x) / 2
    //   })
    //   .attr('y', function (d) {
    //     return d.source.y - (d.source.y - d.target.y) / 2
    //   })
    gs.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
  }
  svg.call(
    d3.zoom().on('zoom', (e) => {
      g.attr('transform', e.transform)
      data.transform = e.transform
    })
  )
  function started(e, n) {
    drag = true
    data.hoverNode = null
    if (!e.active) {
      forceSimulation.alphaTarget(0.8).restart()
    }
    n.fx = n.x
    n.fy = n.y
  }
  function dragged(e, n) {
    n.fx = e.x
    n.fy = e.y
  }
  function ended(e) {
    drag = false
    if (!e.active) {
      forceSimulation.alphaTarget(0)
    }
  }
}
const graphNodes = computed(() => nodes.inUse.graph)
const badRelsBtnPosition = computed(() => {
  const result = {}
  for (const rId in badRels.value) {
    const offset = 9
    const rel = badRels.value[rId]
    const xA = nodes[rel.a_id].x,
      yA = nodes[rel.a_id].y,
      xB = nodes[rel.b_id].x,
      yB = nodes[rel.b_id].y
    result[rId] = {
      position: 'absolute',
      top: data.transform
        ? (yA + (yB - yA) / 2) * data.transform.k -
          offset +
          data.transform.y +
          'px'
        : yA + (yB - yA) / 2 - offset + 'px',
      left: data.transform
        ? (xA + (xB - xA) / 2) * data.transform.k -
          offset +
          data.transform.x +
          'px'
        : xA + (xB - xA) / 2 - offset + 'px',
    }
  }
  return result
})
</script>

<template>
  <e-window
    :name="data.name"
    :icon="data.icon"
    :close="close"
    :buttons="buttons"
    style="flex-grow: 999"
    color="bg-blue-8"
  >
    <template v-slot:content>
      <div class="hover-node" :style="data.hnPosition">
        <e-node
          v-if="data.hoverNode"
          :node="data.hoverNode"
          :address="true"
          :disableActive="true"
          :disablePing="true"
          :key="data.hoverNode.s_id"
        />
      </div>
      <div v-if="activeObject" class="active-object">
        <e-node
          :node="activeObject"
          :address="true"
          :disableActive="true"
          :key="activeObject.s_id"
          :disablePing="true"
        />
      </div>
      <div ref="svgdiv" class="graph-wrap">
        <svg :width="data.width + 'px'" :height="data.height + 'px'"></svg>
      </div>
      <template v-if="label">
        <div
          v-for="node in graphNodes"
          class="hover-node"
          :style="{
            top: data.transform
              ? node.y * data.transform.k - 25 + data.transform.y + 'px'
              : node.y - 25 + 'px',
            left: data.transform
              ? node.x * data.transform.k + 25 + data.transform.x + 'px'
              : node.x + 25 + 'px',
          }"
        >
          <e-node
            :node="node"
            :address="true"
            :disableActive="true"
            :key="node.s_id"
            :disablePing="true"
          /></div
      ></template>
      <q-btn
        v-for="bRel in badRels"
        :key="bRel.id"
        round
        outline
        class="bg-white"
        size="6px"
        color="red-9"
        :style="badRelsBtnPosition[bRel.id]"
        icon="mdi-close"
        @click="delRels([bRel.id])"
      >
        <q-tooltip
          class="bg-red-9"
          anchor="center right"
          self="center left"
          :offset="[10, 10]"
          >Удалить связь</q-tooltip
        >
      </q-btn>
    </template>
  </e-window>
</template>

<style scoped>
/* .asd {
  display: flex;
  flex-direction: column;
} */
.graph-wrap {
  /* background-color: aqua; */
  /* position: relative; */
  flex-grow: 1;
  overflow: hidden;
  font-size: 1.5em;
  /* width: 100%; */
}
.hover-node {
  position: absolute;
  /* border: thin solid lightgrey; */
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.7);
}
.active-object {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: white;
  /* border: thin solid lightgrey; */
  border-radius: 5px;
}
</style>
