import { ParserLldpPorts } from './parser'
import { getNodes, graphRels, nodes, setGraph } from '../stores/nodes'
import { conf } from '../conf'
import { lldp } from '../stores/test'

const getLldpRequest = async (nodesIdSet) => {
  let result
  if (conf.dev) result = lldp
  else {
    const _nodes = []
    for (let nodeId of nodesIdSet) {
      _nodes.push({ id: nodeId, host: nodes[nodeId].s__ip })
    }
    const body = JSON.stringify(_nodes)
    const data = await fetch(conf.loc + '/getLldp', {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body,
    })
    const res = await data.json()
    result = res.filter((r) => r.lldp.status == 'fulfilled')
  }
  result.forEach((nodeLldp) => {
    const node = nodes[nodeLldp.id]
    node.lldp = Object.values(nodeLldp.lldp.value).reduce((prev, value) => {
      prev[value.portSnmpIndex] = value
      return prev
    }, {})
  })
  console.log(result)
  return result
}
const updateRels = async (ctx, rels) => {
  const body = JSON.stringify({
    rels,
  })
  const data = await fetch(ctx.state.loc + '/updateRels', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body,
  })
  const res = await data.json()
  // console.log(res)
}

const SNMP = () => {
  //
  const getRelsFromLldp = async (lldp) => {
    const findIdByMac = (mac) => {
      for (const key in nodes) {
        if (nodes[key].s_mac == mac) return key
      }
    }
    const normRel = []
    const brockRel = []
    lldp.forEach((l) => {
      const a_id = l.id
      for (const key in l.lldp.value) {
        const mac = l.lldp.value[key].r_mac.toUpperCase()
        const b_id = findIdByMac(mac)
        const rel = {
          a_id,
          a_port: key,
          a_portSnmpIndex: l.lldp.value[key].portSnmpIndex,
          b_port: l.lldp.value[key].r_port,
        }
        if (b_id) normRel.push({ ...rel, b_id: Number(b_id) })
        else {
          if (mac in brockRel) brockRel[mac].push(rel)
          else brockRel[mac] = [rel]
        }
      }
    })
    return { normRel, brockRel }
  }
  //
  const getNewNodes = async (rels) => {
    const newNodesIdSet = new Set()
    if (Object.keys(rels.brockRel)[0]) {
      const newNodes = await getNodes(
        { s_mac: Object.keys(rels.brockRel) },
        'graph',
        true
      )
      newNodes.forEach((n) => {
        if (n.type != 1) newNodesIdSet.add(n.s_id)
        const mac = n.s_mac
        for (const rel of rels.brockRel[mac]) {
          rels.normRel.push({ ...rel, b_id: n.s_id })
        }
        delete rels.brockRel[mac]
      })
    }
    return newNodesIdSet
  }
  //
  const getRelsNodesFromLldp = async (
    recursive,
    nodesIdSet,
    rels = { normRel: [], brockRel: {} }
  ) => {
    const lldp = await getLldpRequest(nodesIdSet)
    // console.log(lldp)

    lldp.forEach((l) => {
      l.lldp.value = ParserLldpPorts(l.lldp.value)
    })
    const r = await getRelsFromLldp(lldp)
    // console.log(r)
    // console.log(rels)
    const newNodesIdSet = await getNewNodes(r)
    const newRels = {
      normRel: [...rels.normRel, ...r.normRel],
      brockRel: { ...rels.brockRel, ...r.brockRel },
    }
    if (recursive && newNodesIdSet.size)
      return await getRelsNodesFromLldp(recursive, newNodesIdSet, newRels)
    else return newRels
  }
  //
  const compareRels = (newRel) => {
    newRel.a_type = nodes[newRel.a_id].type
    newRel.b_type = nodes[newRel.b_id].type
    const oldRel = graphRels.value.find((r) => {
      return (
        (newRel.a_id == r.a_id && newRel.b_id == r.b_id) ||
        (newRel.a_id == r.b_id && newRel.b_id == r.a_id)
      )
    })
    if (oldRel) {
      oldRel.source = 'correct'
      if ('change' in oldRel) return
      if (newRel.a_id == oldRel.a_id) {
        if (oldRel.a_port == newRel.a_port && oldRel.b_port == newRel.b_port)
          oldRel.change = false
        else {
          oldRel.a_port = newRel.a_port
          oldRel.a_port_snmp_index = newRel.a_portSnmpIndex
          oldRel.b_port = newRel.b_port
          oldRel.change = true
        }
      } else {
        if (oldRel.a_port == newRel.b_port && oldRel.b_port == newRel.a_port)
          oldRel.change = false
        else {
          oldRel.a_port = newRel.b_port
          oldRel.b_port = newRel.a_port
          oldRel.b_port_snmp_index = newRel.a_portSnmpIndex
          oldRel.change = true
        }
      }
    } else {
      graphRels.value.push({
        ...newRel,
        change: true,
        source: 'lldp',
      })
    }
  }
  //
  const getLldp = async (nodesIdSet, recursive = true) => {
    return new Promise(async (resolve, reject) => {
      try {
        const rels = await getRelsNodesFromLldp(recursive, nodesIdSet)
        rels.normRel.forEach((nr) => {
          compareRels(nr)
        })
        const relsForUpdate = graphRels.value.filter((r) => r.change)
        if (relsForUpdate.length > 0) {
          updateRels(relsForUpdate)
          relsForUpdate.forEach((r) => (r.change = false))
        }
        setGraph()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  return Object.freeze({ getLldp })
}

export default SNMP
