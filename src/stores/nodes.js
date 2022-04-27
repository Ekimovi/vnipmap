import { reactive, ref, watch } from 'vue'
import { conf } from '../conf'
import Graph from '../api/graph'
// import { useRouter } from 'vue-router'

// const router = useRouter()

/* const pushAciveNodeId = (activeNodeId) => {
  console.log(router)
  router.push({
    path: '/',
    query: {
      activeNodeId,
    },
  })
} */
const nodes = reactive({ inUse: { graph: {}, search: {} } })
const graphRels = ref([])
const activeNodeId = ref(0)
const force = ref(false)
const graph = ref({})

watch(
  () => activeNodeId.value,
  async (id) => {
    if (graph.value.nodes && id in graph.value.nodes && !force.value) return
    getGraph(activeNodeId.value)
  }
)
// watch(
//   () => force.value,
//   (val) => {
//     if (val) getGraph(activeNodeId.value)
//   }
// )
watch(
  () => nodes.inUse.graph,
  () => {
    graph.value = Graph({
      rels: graphRels.value,
      nodes: nodes.inUse.graph,
    })
  }
)

const syncNodes = (_nodes, mark, add = false) => {
  const newSet = {}
  _nodes.forEach((n) => {
    nodes[n.s_id] = n.s_id in nodes ? { ...nodes[n.s_id], ...n } : n
    newSet[n.s_id] = nodes[n.s_id]
  })
  nodes.inUse[mark] = add ? { ...nodes.inUse[mark], ...newSet } : newSet
}

const inUseHas = (id) => {
  for (const key in nodes.inUse) {
    if (id in nodes.inUse[key]) return true
  }
  return false
}
const cleanNodes = () => {
  for (const id in nodes) {
    if (id != 'inUse' && !inUseHas(id)) delete nodes[id]
  }
}
for (const mark in nodes.inUse) watch(() => nodes.inUse[mark], cleanNodes)

const getNodes = async (props, mark) => {
  const body = JSON.stringify(props)
  const data = await fetch(conf.loc + '/getNodes', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const newNodes = await data.json()
  syncNodes(newNodes, mark)
}

const getRels = async (id) => {
  let body = JSON.stringify({ id })

  let res = await fetch(conf.loc + '/getRels', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  return await res.json()
}

const getNodesIdsFromRels = (rels) => {
  const nodesIds = new Set()
  rels.forEach((r) => {
    nodesIds.add(r.a_id)
    nodesIds.add(r.b_id)
  })
  return nodesIds
}

const getGraph = async (id) => {
  force.value = false
  const newRels = await getRels(id)
  graphRels.value = newRels
  const ids = '(' + [...getNodesIdsFromRels(newRels).add(id)].join(', ') + ')'
  // graph.value = {}
  getNodes({ ids }, 'graph')
}

const ping = async (node) => {
  const body = JSON.stringify({
    host: { id: node.s_id, ip: node.s__ip },
  })
  node.ping = true
  const data = await fetch(conf.loc + '/pingNode', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const res = await data.json()
  if (res.id in nodes) {
    nodes[res.id].ping = false
    nodes[res.id].s_state = res.status ? 'LIFE' : 'DIE'
  }
}

export { nodes, activeNodeId, graph, graphRels, getNodes, ping, force, getGraph }
