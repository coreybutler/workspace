'use strict'

const space = require('./space')
const chalk = require('chalk')
const path = require('path')

module.exports = (prefs) => {
  space((err, cwd, data) => {
    if (err) {
      console.log(chalk.red.bold(err.message))
      return
    }

    console.log(`\n  - ${chalk.yellow.bold('workspace:')} ${cwd}`)

    Object.keys(data).forEach((item) => {
      console.log(`  - ${chalk.yellow.bold(item)}: ${data[item]}`)
    })

    console.log('')
  })
}
