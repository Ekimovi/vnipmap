import { reactive, ref, watch } from 'vue'
import { show } from './show'
import { conf } from '../conf'
import Graph from '../api/graph'
import { upd, sfpTest } from './test'
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
const searchField = ref('')

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
    setGraph()
  }
)
const setGraph = () => {
  graph.value = Graph({
    rels: graphRels.value,
    nodes: nodes.inUse.graph,
  })
}
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

const getNodes = async (props, mark, add) => {
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
  syncNodes(newNodes, mark, add)
  return newNodes
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
  const result = await res.json()
  console.log('relsss', result)
  return result
}

const getPorts = async (nodeId) => {
  const body = JSON.stringify({
    nodeId,
  })
  const data = await fetch(conf.loc + '/getPorts', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const res = await data.json()
  if (nodeId in nodes) {
    nodes[nodeId].ports = res
  }
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
  const s_id = [...getNodesIdsFromRels(newRels).add(id)]
  // graph.value = {}
  getNodes({ s_id }, 'graph')
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

const pushSfpDataToPorts = (sfpData, node) => {
  sfpData.forEach((sfp) => {
    if (!sfp.lengthWave) return
    const port = node.ports.find((port) => port.p_index == sfp.portIndex)
    console.log(port)
    if (!port) return
    port.sfp = sfp
  })
  console.log('nodeSfp', node)
}

const getSfpData = async (node) => {
  if (conf.dev) return pushSfpDataToPorts(sfpTest, node)
  const body = JSON.stringify({
    s_id: node.s_id,
    host: node.s__ip,
  })
  const data = await fetch(conf.loc + '/getSfpData', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const res = await data.json()
  if ('error' in res) {
    show.alert.push(res.error)
    // console.log(res)
    // console.log(show.alert)
    return
  }
  pushSfpDataToPorts(res, node)
}

const updateNode = ({ s_id, updateData }) => {
  console.log('snmpNode', updateData)
  const node = nodes[s_id]
  node.startTime = updateData.m_start_time
  updateData.portList.forEach((port) => {
    const oldPort = node.ports.find((oldP) => oldP.p_num == port.p_num) || {}
    for (const key in port) oldPort[key] = port[key]
  })
  getSfpData(nodes[s_id])
}
const getNodeUpdate = async (node) => {
  if (conf.dev) return updateNode({ s_id: node.s_id, updateData: upd })
  const body = JSON.stringify({
    s_id: node.s_id,
    host: node.s__ip,
  })
  const data = await fetch(conf.loc + '/getNodeUpdate', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const res = await data.json()
  if ('error' in res) {
    show.alert.push(res.error)
    // console.log(res)
    // console.log(show.alert)
    return
  }
  updateNode({ s_id: node.s_id, updateData: res })
}
const delRels = async (rels) => {
  const query = { delRel: rels }
  const body = JSON.stringify({
    query,
  })
  fetch(conf.loc + '/saveCircle', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const relsSet = new Set(rels)
  graphRels.value = graphRels.value.filter((r) => !relsSet.has(r.id))
  setGraph()
}

watch(
  () => graphRels.value,
  (val) => console.log(val)
)

export {
  nodes,
  activeNodeId,
  graph,
  graphRels,
  getNodes,
  ping,
  force,
  getGraph,
  getPorts,
  getNodeUpdate,
  setGraph,
  delRels,
  searchField,
}
