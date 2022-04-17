const newRel = (rel) => {
  const sourceType = { correct: 0, lldp: 1, ipmap: 2, tr: 3 }
  const worth = sourceType[rel.source]
  return { ...rel, worth }
}

// class Rel {
//   constructor(rel) {
//     for (let key in rel) {
//       this[key] = rel[key]
//     }
//     this.w = null
//   }
//   get worth() {
//     if (this.w) return this.w
//     const sourceType = { correct: 0, lldp: 1, ipmap: 2, tr: 3 }
//     return (this.w = sourceType[this.source])
//   }
// }

export default class Graph {
  constructor(rels, nodes) {
    this.rels = rels.reduce((prev, rel) => {
      return [...prev, newRel(rel)]
    }, [])
    this.nodes = nodes
    this.firstR = null
  }
  get firstRel() {
    if (this.firstR) return this.firstR
    let res

    let rs = this.rels.filter((r) => r.b_type || r.a_type)
    const bestRel = rs.sort((a, b) => a.worth - b.worth)[0]
    if (bestRel.a_type)
      res = {
        ...bestRel,
        start: this.nodes.find((n) => n.s_id == bestRel.a_id),
        end: this.nodes.find((n) => n.s_id == bestRel.b_id),
      }
    else
      res = {
        ...bestRel,
        start: this.nodes.find((n) => n.s_id == bestRel.b_id),
        end: this.nodes.find((n) => n.s_id == bestRel.a_id),
      }
    this.firstR = res
    return res
  }
  getNearRels(node) {
    return [
      ...this.rels
        .filter((r) => {
          return r.a_id == node.s_id
        })
        .reduce((prev, rel) => {
          return [
            ...prev,
            {
              ...rel,
              start: node,
              end: this.nodes.find((n) => n.s_id == rel.b_id),
            },
          ]
        }, []),
      ...this.rels
        .filter((r) => {
          return r.b_id == node.s_id
        })
        .reduce((prev, rel) => {
          return [
            ...prev,
            {
              ...rel,
              start: node,
              end: this.nodes.find((n) => n.s_id == rel.a_id),
            },
          ]
        }, []),
    ]
  }

  getNextRels(path, node) {
    // console.log(path)
    const pathNodes = path.reduce((prev, rel) => {
      return [...new Set([...prev, rel.start, rel.end])]
    }, [])
    const nearRels = this.getNearRels(node)
    if (!nearRels.length) return null

    const res = nearRels.filter((r) => {
      // console.log(r.end)
      // console.log(pathNodes)
      return (
        (r.end.type == 1 && !path.find((rel) => rel.id == r.id)) ||
        !pathNodes.find((n) => n.s_id == r.end.s_id)
      )
    })
    if (!res.length) return null

    return res
    // const res = nearRels.reduce((prev, rel) => {
    //   if (path[0] && path.find((r) => r.id == rel.id)) return prev
    //   if (rel.end.type == 1) return [...prev, [rel, false]]
    //   if (patchNodes.find((n) => n == rel.end)) return [...prev, [rel, null]]
    //   return [...prev, [rel]]
    // }, [])
    // if (this.debug && curentNode.s_id == 58640) {
    //   console.log(res)
    //   console.log(path)
    // }
  }

  getPathes() {
    const gPathes = (curentPath, curentRel) => {
      const nextRels = this.getNextRels(curentPath, curentRel.end)

      if (nextRels == null) return curentPath.push(null)
      const copyCurentPath = [...curentPath]
      nextRels.forEach((rel, i) => {
        if (i == 0) {
          if (rel.end.type) curentPath.push(rel, false)
          else {
            curentPath.push(rel)
            gPathes(curentPath, rel)
          }
        } else {
          const newPath = [...copyCurentPath, rel]
          if (rel.end.type) allPatches.push([...copyCurentPath, rel, false])
          else {
            allPatches.push(newPath)
            gPathes(newPath, rel)
          }
        }
      })
    }

    const cp = [this.firstRel]
    let allPatches = [cp]
    gPathes(cp, this.firstRel)

    return allPatches
  }

  getPathWorth(pathes) {
    return pathes.reduce((prev, path) => {
      return [
        ...prev,
        path.reduce((prev, rel) => {
          if (!rel) return prev
          if (rel.source == 'lldp' || rel.source == 'correct') return prev + 1
          else return prev - 1
        }, 0),
      ]
    }, [])
  }

  get sortedPathes() {
    return this.getPathes()
      .map((path, i) => ({
        worth: this.getPathWorth(this.getPathes())[i],
        path,
      }))
      .sort((a, b) => a.worth - b.worth)
  }

  get horde() {
    const pathes = this.sortedPathes
    let hordePathes = pathes.filter((p) => p.path[p.path.length - 1] == false)
    if (hordePathes.length == 0)
      return pathes
        .reduce((res, path) => {
          if (path.worth > res.worth) return path
          else return res
        }, pathes[0])
        .path.slice(0, -1)
    return hordePathes
      .reduce((res, path) => {
        if (path.worth > res.worth) return path
        else return res
      }, hordePathes[0])
      .path.slice(0, -1)
  }

  get tree() {
    let tree = this.horde
    let ignoredRels = [...this.horde]
    // this.debug = true

    const getSubRels = (rel) => {
      // console.log(rel)
      rel.sub = this.getNextRels(ignoredRels, rel.end)
      // console.log(rel.sub)
      if (rel.sub) {
        ignoredRels.push(...rel.sub)
        //  = [
        //   ...ignoredRels,
        //   ...rel.sub.reduce((res, rel) => {
        //     if (rel) return [...res, rel]
        //     else return res
        //   }, []),
        // ]
        // console.log(ignoredRels)
        rel.sub.forEach((r) => {
          if (r) getSubRels(r)
        })
      }
    }

    tree.forEach((rel) => {
      getSubRels(rel)
    })
    return tree
  }
}
