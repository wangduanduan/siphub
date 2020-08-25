const statistics = {
  h_receive: 0,
  h_insertdb: 0,
  h_drop: 0
}

// setInterval(resetStat, 10 * 1000);

module.exports.resetStat = function () {
  Object.keys(statistics).forEach((key) => {
    statistics[key] = 0
  })
}

module.exports.getStat = function () {
  return statistics
}

module.exports.updateStat = function (group, key, value) {
  let stat = `${group}_${key}`

  if (typeof statistics[stat] === 'undefined') {
    return
  }

  if (statistics[stat] >= Number.MAX_SAFE_INTEGER) {
    statistics[stat] = 0
  }

  statistics[stat] += value
}
