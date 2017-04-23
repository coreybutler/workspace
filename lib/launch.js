'use strict'

const path = require('path')
const chalk = require('chalk')
const space = require('./space')
const yaml = require('js-yaml')
const inquirer = require('inquirer')
const command = require('./command')

module.exports = (prefs) => {
  space((err, cwd, data) => {
    let cmd = command(cwd, data)

    console.log(`\nCurrent launch command: ${chalk.cyan(cmd)}`)
    console.log(chalk.yellow('Type ctrl+c to continue using current command.\n'))

    inquirer.prompt([{
      type: 'input',
      name: 'lcmd',
      message: 'Launch command:',
      default: 'default'
    }]).then((answers) => {
      if (!(data.launch === 'default' && answers.lcmd === cmd)) {
        data.launch = answers.lcmd

        require('fs').writeFileSync(path.join(cwd, '.workspace.yml'), yaml.safeDump(data))
      }
    })
  })
}
