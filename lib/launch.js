'use strict'

const path = require('path')
const chalk = require('chalk')
const space = require('./space')
const yaml = require('js-yaml')
const inquirer = require('inquirer')

module.exports = (prefs) => {
  space((err, cwd, data) => {
    let tag = data.tag !== 'none' ? data.tag : data.name

    try {
      let pkg = JSON.parse(require('fs').readFileSync(path.join(cwd, data.main, 'package.json')).toString())

      if (pkg.hasOwnProperty('version')) {
        tag += `:${pkg.version}`
      }
    } catch (e) {}

    let args = [
      'run', '--rm', '-it',
      '--name', data.name,
      '-v', `${path.join(cwd, data.main)}:/app`,
      tag,
      'sh'
    ]

    if (data.hasOwnProperty('launch')) {
      if (data.launch.trim().toLowerCase() === 'default') {
        cmd = args.unshift('docker')
        cmd = cmd.join(' ')
      } else {
        cmd = data.launch
      }
    }

    console.log(`Current launch command: ${chalk.cyan(cmd)}`)

    inquirer.prompt([{
      type: 'input',
      name: 'lcmd',
      message: 'Launch command:'
      default: cmd
    }]).then((answers) => {
      if (!(data.launch === 'default' && answers.lcmd === cmd)) {
        data.launch = answers.lcmd

        require('fs').writeFileSync(path.join(cwd, '.workspace.yml'), yaml.safeDump(data))
      }
    })
  })
}
