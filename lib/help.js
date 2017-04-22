'use strict'

const chalk = require('chalk')

module.exports = (prefs) => {
  let defs = [{
    cmd: 'init',
    alias: null,
    desc: 'Create a new workspace from scratch. This is usually done in an empty directory.'
  }, {
    cmd: 'inspect',
    alias: ['-i'],
    desc: 'Review details of the current workspace.'
  }, {
    cmd: 'build',
    alias: ['rebuild', '-b'],
    desc: 'Build the workspace environment.'
  }, {
    cmd: 'publish',
    alias: ['pub', '-p'],
    desc: 'Publish the environment to a Docker registry.'
  }, {
    cmd: 'run',
    alias: ['start', 'open'],
    desc: 'Launch/use the workspace.'
  }, {
    cmd: 'clean',
    alias: ['-c', 'nuke'],
    desc: 'Remove all known environment builds.'
  }, {
    cmd: 'help',
    alias: ['-h'],
    desc: 'This menu.'
  }]

  console.log('COMMAND List\n')
  defs.sort((a, b) => {
    if (a.cmd > b.cmd) {
      return 1
    } else if (a.cmd < b.cmd) {
      return -1
    }
    return 0
  })

  console.log('\nworkspace [COMMAND]')
  console.log(chalk.gray('\nws [COMMAND] (Shortcut)\n\n'))
  defs.forEach((menu) => {
    console.log(menu.cmd)
  })
}
