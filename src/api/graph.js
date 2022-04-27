import { worth } from '../stores/constant'

const Graph = ({ rels, nodes }) => {
  const getGraph = () => {
    const res = {}
    rels.forEach((rel) => {
      const { a_id, b_id } = rel
      if (a_id in nodes && b_id in nodes) {
        a_id in res
          ? res[a_id].push({ rel, node: nodes[b_id] })
          : (res[a_id] = [{ rel, node: nodes[b_id] }])
        b_id in res
          ? res[b_id].push({ rel, node: nodes[a_id] })
          : (res[b_id] = [{ rel, node: nodes[a_id] }])
      }
    })
    return res
  }
  const graph = getGraph()

  // // get NiossPlace
  // const getNioss = node => {
  //   const findPlaceNiossNameByAddress = address => {
  //     const n = Object.values(nodes).find(n => {
  //       return n.s_address == address && Nioss(n.s_niossname).place
  //     })
  //     if (n) return Nioss(n.s_niossname)
  //     return Nioss('')
  //   }
  //
  //   const nioss = Nioss(node.s_niossname)
  //
  //   if (nioss.place) return nioss
  //   else return findPlaceNiossNameByAddress(node.s_address)
  // }
  // // get NiossPlaces
  // const getNiossPlaces = () => {
  //   const res = {}
  //   for (const id in nodes) {
  //     const node = nodes[id]
  //     const nioss = getNioss(node)
  //     const placeNiossName = nioss.place
  //     placeNiossName in res
  //       ? res[placeNiossName].push(node)
  //       : (res[placeNiossName] = [node])
  //     node.nioss = nioss
  //   }
  //   return res
  // }
  // get Mu
  const getMu = () => {
    return Object.values(nodes)
      .filter((n) => n.type == 1)
      .reduce((res, n) => {
        res[n.s_id] = n
        return res
      }, {})
  }
  const mu = getMu()
  //get rootMu
  const getRootMu = () => {
    return Object.values(mu).sort((a, b) => {
      const bR = graph[b.s_id] || []
      const aR = graph[a.s_id] || []
      return bR.length - aR.length
    })[0]
  }
  const rootMu = getRootMu() || Object.values(nodes)[0]

  // get Path
  const getAllPathes = (src, path, visited) => {
    path.push(src)
    if (
      src.node.s_id in mu &&
      (visited.size > 2 || src.node.s_id != rootMu.s_id)
    ) {
      //TODO problem with m1-d-m2
      visited.add(src.node.s_id)
      return [{ path, visited, circle: true }]
    }
    if (visited.has(src.node.s_id)) return false

    visited.add(src.node.s_id)

    const allPathes = []
    for (let next of graph[src.node.s_id]) {
      const newAllPathes = getAllPathes(next, [...path], new Set([...visited]))
      if (newAllPathes) allPathes.push(...newAllPathes)
    }
    if (allPathes.length > 0) return allPathes

    return [{ path, visited }]
  }

  const getPathWorth = (path) => {
    return path.reduce((res, rn) => {
      return rn.rel ? res + worth[rn.rel.source] : 0
    }, 0)
  }

  const getHorde = (firstRn) => {
    const startPath = [{ node: rootMu }]
    const startVisited = new Set([rootMu.s_id])
    const allPathes = getAllPathes(firstRn, startPath, startVisited)
    const circleHordes = allPathes.filter((path) => path.circle)
    if (circleHordes.length > 0)
      return circleHordes.sort(
        (a, b) => getPathWorth(b.path) - getPathWorth(a.path)
      )[0]
    return allPathes.sort(
      (a, b) => getPathWorth(b.path) - getPathWorth(a.path)
    )[0]
  }

  const getSub = (rn, treeNodes) => {
    if (rn.node.s_id in mu) return
    const next = graph[rn.node.s_id]
    const sub = []
    next.forEach((nrn) => {
      if (!treeNodes.has(nrn.node.s_id)) {
        sub.push(nrn)
        treeNodes.add(nrn.node.s_id)
        getSub(nrn, treeNodes)
      }
    })
    if (sub[0]) rn.sub = sub
  }

  const getTree = (firstRn) => {
    const horde = getHorde(firstRn)
    const treeNodes = horde.visited
    const tree = horde.path
    for (let rn of tree) {
      getSub(rn, treeNodes)
    }
    return { tree, treeNodes }
  }
  //statTree
  const statTree = (tree) => {
    tree.places = {}
    let i = 0
    tree.treeNodes.forEach((nid) => {
      const node = nodes[nid]
      const place = node.ad_id
      if (place in tree.places) {
        tree.places[place].nodes.push(node)
        node.groupIndex = tree.places[place].groupIndex
      } else {
        node.groupIndex = i
        tree.places[place] = { groupIndex: i++, nodes: [node] }
      }
    })
  }
  // statAllTrees
  const statAllTrees = (allTrees) => {
    allTrees.forEach((tree) => statTree(tree))
  }

  const getTreeId = (treeNodes) => {
    let nTreeId = null
    for (const s_id of treeNodes) {
      if (nodes[s_id].nTreeId) {
        nTreeId = nodes[s_id].nTreeId
        break
      }
    }
    if (!nTreeId) nTreeId = Math.random()
    for (const s_id of treeNodes) {
      if (nodes[s_id].type != 1) nodes[s_id].nTreeId = nTreeId
    }
    return nTreeId
  }

  const getAllTrees = () => {
    let allTreeNodes = new Set()
    const allTrees = []
    const corSource = new Set(['lldp', 'correct'])
    const gtree = (correct) => {
      for (let startRn of graph[rootMu.s_id]) {
        if (
          !allTreeNodes.has(startRn.node.s_id) &&
          (!correct || corSource.has(startRn.rel.source))
        ) {
          const res = getTree(startRn)
          res.treeId = getTreeId(res.treeNodes)
          allTrees.push(res)
          allTreeNodes = new Set([...allTreeNodes, ...res.treeNodes])
        }
      }
    }
    gtree(true)
    gtree(false)
    statAllTrees(allTrees)
    return allTrees
  }
  const allTrees = getAllTrees()

  return Object.freeze({
    nodes,
    graph,
    mu,
    getRootMu,
    allTrees,
  })
}

export default Graph
