'use strict'

const chalk = require('chalk')

module.exports = (prefs) => {
  let defs = [{
    cmd: 'init',
    alias: null,
    desc: 'Create a new workspace from scratch.'
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
  }, {
    cmd: 'cmd',
    alias: ['--cmd'],
    desc: 'Set a new launch command for "workspace run".'
  }, {
    cmd: 'version',
    alias: ['-v', '--version'],
    desc: 'Display the active version of this utility.'
  }]

  defs.sort((a, b) => {
    if (a.cmd > b.cmd) {
      return 1
    } else if (a.cmd < b.cmd) {
      return -1
    }
    return 0
  })

  console.log(chalk.cyan.bold('\n  workspace [COMMAND]'))
  console.log(chalk.cyan.bold('  ws [COMMAND] (Shortcut)\n'))
  console.log('  ' + chalk.gray.underline('Commands\n'))

  let max = 0

  defs.forEach((menu) => {
    if (menu.cmd.length > max) {
      max = menu.cmd.length
    }
  })

  max += 7

  defs.forEach((menu) => {
    let line = `  ${menu.cmd}:`
    while (line.length < max) {
      line += ' '
    }

    line = chalk.cyan(line)

    line += menu.desc

    if (menu.alias && menu.alias.length > 0) {
      line += chalk.gray(` [${menu.alias.join(', ')}]`)
    }

    console.log(line)
  })
  console.log('')
}
