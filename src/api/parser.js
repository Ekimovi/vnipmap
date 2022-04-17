const pattern = {
  index: {
    '17410': 'GigabitEthernet1/0/1',
    '17411': 'GigabitEthernet1/0/2',
    '17412': 'GigabitEthernet1/0/3',
    '17413': 'GigabitEthernet1/0/4',
    '17414': 'GigabitEthernet1/0/5',
    '17415': 'GigabitEthernet1/0/6',
    '17416': 'GigabitEthernet1/0/7',
    '17417': 'GigabitEthernet1/0/8',
    '17418': 'GigabitEthernet1/0/9',
    '17419': 'GigabitEthernet1/0/10',
    '17420': 'GigabitEthernet1/0/11',
    '17421': 'GigabitEthernet1/0/12',
    '17422': 'GigabitEthernet1/0/13',
    '17423': 'GigabitEthernet1/0/14',
    '17424': 'GigabitEthernet1/0/15',
    '17425': 'GigabitEthernet1/0/16',
    '17426': 'GigabitEthernet1/0/17',
    '17427': 'GigabitEthernet1/0/18',
    '17428': 'GigabitEthernet1/0/19',
    '17429': 'GigabitEthernet1/0/20',
    '17430': 'GigabitEthernet1/0/21',
    '17431': 'GigabitEthernet1/0/22',
    '17432': 'GigabitEthernet1/0/23',
    '17433': 'GigabitEthernet1/0/24',
    '17434': 'GigabitEthernet1/0/25',
    '17435': 'GigabitEthernet1/0/26',
    '17436': 'GigabitEthernet1/0/27',
    '17437': 'GigabitEthernet1/0/28',
    '17438': 'GigabitEthernet1/0/29',
    '17439': 'GigabitEthernet1/0/30',
    '17440': 'GigabitEthernet1/0/31',
    '17441': 'GigabitEthernet1/0/32',
    '17442': 'GigabitEthernet1/0/33',
    '17443': 'GigabitEthernet1/0/34',
    '17444': 'GigabitEthernet1/0/35',
    '17445': 'GigabitEthernet1/0/36',
    '17446': 'GigabitEthernet1/0/37',
    '17447': 'GigabitEthernet1/0/38',
    '17448': 'GigabitEthernet1/0/39',
    '17449': 'GigabitEthernet1/0/40',
    '17450': 'GigabitEthernet1/0/41',
    '17451': 'GigabitEthernet1/0/42',
    '17452': 'GigabitEthernet1/0/43',
    '17453': 'GigabitEthernet1/0/44',
    '17454': 'GigabitEthernet1/0/45',
    '17455': 'GigabitEthernet1/0/46',
    '17456': 'GigabitEthernet1/0/47',
    '17457': 'GigabitEthernet1/0/48',
    '17474': 'XGigabitEthernet1/1/1',
    '17475': 'XGigabitEthernet1/1/2',
    '17538': 'XGigabitEthernet1/2/1',
    '17539': 'XGigabitEthernet1/2/2'
  },
  pName: {
    'ÈÓ£@¾9': '9'
  }
}
const Nioss = niossString => {
  const regExp = /(.+)_(.+).(\d{5})_(\d+)/
  const res = niossString ? niossString.match(regExp) : null

  return Object.freeze({
    get type() {
      return res ? res[1] : null
    },
    get region() {
      return res ? res[2] : null
    },
    get place() {
      return res ? res[3] : null
    },
    get index() {
      return res ? res[4] : null
    }
  })
}
const ParserLldpPorts = lldp => {
  const res = {}
  for (const key in lldp) {
    // lldp[key].portSnmpIndex = key
    let pKey = key
    if (key in pattern.index) {
      pKey = pattern.index[key]
    }
    res[pKey] = lldp[key]
    const pName = res[pKey].r_port
    // console.log(pName)
    if (pName in pattern.pName) res[pKey].r_port = pattern.pName[pName]
    const regexp = /[a-zA-Z0-9\/]+/
    res[pKey].r_port = res[pKey].r_port.match(regexp)[0]
  }
  return res
}

const msToTime = duration => {
  let seconds = parseInt((duration / 1000) % 60)
  let minutes = parseInt((duration / (1000 * 60)) % 60)
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24)
  let days = parseInt(duration / (1000 * 60 * 60 * 24))
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  return days + ' day' + ', ' + hours + ':' + minutes + ':' + seconds
}

export { Nioss, ParserLldpPorts, msToTime }
