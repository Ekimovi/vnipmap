import { reactive, ref, watch } from 'vue'
import { conf } from '../conf'
import Graph from '../api/graph'

const nodes = reactive({})
const activeNodeId = ref(0)
const graph = ref({})

watch(() => activeNodeId.value, async id => {
  if (graph.value.nodes && id in graph.value.nodes) return
  const { rels, _nodes } = await getRelsNodes(id)
  graph.value = Graph({
    rels, nodes: _nodes.reduce((prev, n) => {
      prev[n.s_id] = n
      return prev
    }, {})
  })
})

const syncNodes = (_nodes) => {
  _nodes.forEach(n => {
    if (n.s_id in nodes) {
      nodes[n.s_id] = { ...nodes[n.s_id], ...n }
      nodes[n.s_id].inUse++
    } else {
      nodes[n.s_id] = { ...n, inUse: 1 }
    }
  })
  return _nodes.map(n => nodes[n.s_id])
}

const delFromNodes = (_nodes) => {
  _nodes.forEach(n => {
    if (n.inUse > 1) n.inUse
    else delete nodes[n.s_id]
  })
}

const getNodes = async props => {
  const body = JSON.stringify(props)
  const data = await fetch(conf.loc + '/getNodes', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body
  })
  const _nodes = await data.json()
  return syncNodes(_nodes)
}

const getRelsNodes = async id => {

  let body = JSON.stringify({ id: id })

  let res = await fetch(conf.loc + '/getRels', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body
  })
  const rels = reactive(await res.json())
  const nodesId = [id]
  rels.forEach(r => {
    nodesId.push(r.a_id)
    nodesId.push(r.b_id)
  })
  const nodesIds = [...new Set(nodesId)]

  let fId = nodesIds.toString()
  body = JSON.stringify({ ids: fId })

  res = await fetch(conf.loc + '/getNodesRel', {
    method: 'POST', headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body
  })
  const _nodes = syncNodes(await res.json())
  return { rels, _nodes }
}

export {
  nodes,
  activeNodeId,
  graph,
  getNodes,
  getRelsNodes,
  delFromNodes
}
