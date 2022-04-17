const newGraph = (relss, nodes) => {
  //
  let nodesRels = null
  let allTrees = []
  let allTrees_ = {}

  const newRel = rel => {
    const sourceType = { correct: 1, lldp: 1, ipmap: 0, tr: -2 }
    const worth = sourceType[rel.source]
    return { ...rel, worth }
  }

  const getNodesRels = () => {
    if (nodesRels) return nodesRels
    nodesRels = relss.reduce((p, rel) => {
      rel = newRel(rel)
      const [a, b] = [
        nodes.find(n => n.s_id == rel.a_id),
        nodes.find(n => n.s_id == rel.b_id)
      ]
      p[a.s_id]
        ? p[a.s_id].rNodes.push({ node: b, rel })
        : (p[a.s_id] = { node: a, rNodes: [{ node: b, rel }] })
      p[b.s_id]
        ? p[b.s_id].rNodes.push({ node: a, rel })
        : (p[b.s_id] = { node: b, rNodes: [{ node: a, rel }] })
      return p
    }, {})
    return nodesRels
  }

  const getMu = () => {
    let res = {}
    const nRels = getNodesRels()
    for (let key in nRels) {
      if (nRels[key].node.type) res[key] = nRels[key]
    }
    return res
  }

  const getBestMu = () => {
    let res = {}
    let lastLength = 0
    const mu = getMu()
    for (let key in mu) {
      const l = mu[key].rNodes.length
      if (l > lastLength) {
        res = mu[key]
        lastLength = l
      }
    }
    return res
  }

  const getTree = startPath => {
    let statistics = { countDuNodes: 0, countDie: 0, sub: 0, broken: false }
    const validateRepeatNode = (ignoredNodes, rNode) => {
      return !!ignoredNodes.find(rn => rn.node.s_id == rNode.node.s_id)
    }

    const getAllPathes = () => {
      let allPathes = [startPath]

      const pushPathes = (
        currentPath,
        relNode = currentPath[currentPath.length - 1]
      ) => {
        if (relNode.rel.a_type == 1 && relNode.rel.b_type == 1) return
        let nextRelNodes = nodesRels[relNode.node.s_id].rNodes
        const copyCurrentPath = [...currentPath]
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        nextRelNodes = nextRelNodes.filter(
          nr =>
            !validateRepeatNode(currentPath, nr) ||
            (nr.node.type && nr.rel.id != relNode.rel.id)
        )
        nextRelNodes.forEach((nextRelNode, i) => {
          if (i == 0) {
            currentPath.push(nextRelNode)
            if (!nextRelNode.node.type) pushPathes(currentPath, nextRelNode)
          } else {
            const newCurrentPath = [...copyCurrentPath, nextRelNode]
            allPathes.push(newCurrentPath)
            if (!nextRelNode.node.type) pushPathes(newCurrentPath, nextRelNode)
          }
        })
      }
      pushPathes(startPath)

      return allPathes
    }

    const getHorde = () => {
      const allPathes = getAllPathes()
      let aPathes
      const pathesMu = allPathes.filter(path => path[path.length - 1].node.type)
      if (pathesMu.length) aPathes = pathesMu
      else aPathes = allPathes
      const getPathWorth = path => {
        return path.reduce((prev, relNode) => {
          if (relNode.rel) return prev + relNode.rel.worth
          return 0
        }, 0)
      }
      return aPathes.sort((a, b) => getPathWorth(b) - getPathWorth(a))[0]
    }

    const horde = getHorde()

    const getHordeIndex = () => {
      const index = horde.map(relNode => relNode.node.s_id)
      const aIndex = index.join('.')
      const rIndex = index.reverse().join('.')
      return { aIndex, rIndex }
    }
    const hordeIndex = getHordeIndex()
    if (allTrees_[hordeIndex.rIndex]) return null

    const tree = [...horde]
    let ignoredNodes = [...horde]
    const circles = {}

    const pushStatistics = relNode => {
      if (relNode.node.s_monitor == 0) {
        statistics.countDuNodes++
        if (relNode.node.s_state == 'DIE') statistics.countDie++
      }
    }

    const getSub = rNode => {
      pushStatistics(rNode)
      circles[rNode.node.c_id] = {
        c_id: rNode.node.c_id,
        c_type: rNode.node.c_type
      }
      let sub = nodesRels[rNode.node.s_id].rNodes.filter(
        nr => !validateRepeatNode(ignoredNodes, nr)
      )
      if (sub[0]) {
        rNode.sub = sub
        ignoredNodes.push(...sub)
        rNode.sub.forEach(rn => getSub(rn))
      }
    }

    for (let i = 1; i < tree.length; i++) {
      if (i == tree.length - 1) {
        if (tree[i].node.c_id) {
          pushStatistics(tree[i])
          statistics.sub = null
          circles[tree[i].node.c_id] = {
            c_id: tree[i].node.c_id,
            c_type: tree[i].node.c_type
          }
        }
      } else getSub(tree[i])
    }

    tree.forEach(relNode => {
      if (statistics.sub != null && relNode.sub) statistics.sub++
      if (relNode.rel && relNode.rel.source == 'ipmap') statistics.broken = true
    })

    const s = {
      index: hordeIndex.aIndex,
      tree,
      circles: Object.values(circles),
      statistics
    }

    if (s.circles.length < 1) s.circles = [{ c_id: 0, c_type: 0 }]

    return s
  }

  const getAllTrees = () => {
    if (allTrees[0]) return allTrees
    const bestMu = getBestMu()

    bestMu.rNodes.forEach(relNode => {
      const res = getTree([{ node: bestMu.node }, relNode])
      if (res) allTrees_[res.index] = res
    })
    allTrees = Object.values(allTrees_)
    return allTrees
  }

  const groupTree = (t, keys) => {
    t.forEach(n => {
      const regNioss = /(\d{5})/
      const m = n.node.s_niossname.match(regNioss)
      if (m) {
        let key = m[1]
        if (keys.groups[key]) n.node.group = keys.groups[key]
        else {
          n.node.group = keys.i
          keys.groups[key] = keys.i++
        }
        if (n.sub) groupTree(n.sub, keys)
      }
    })
  }

  const groupTrees = () => {
    const trees = getAllTrees()
    let keys = []
    trees.forEach((t, index) => {
      keys[index] = { i: 0, groups: {} }
      groupTree(t.tree, keys[index])
    })
    return allTrees
  }

  return Object.freeze({
    getNodesRels,
    getBestMu,
    getAllTrees,
    groupTrees
  })
}

export { newGraph }
