'use strict'

const path = require('path')
const chalk = require('chalk')
const space = require('./space')
const yaml = require('js-yaml')
const inquirer = require('inquirer')

module.exports = (prefs, args) => {
  space((err, cwd, data) => {
    data.exposed = data.exposed || []

    // Expose a port quickly
    if (args.length > 0) {
      if (!args.includes('ls')) {
        args.forEach((port) => {
          port = port.split(':')
          if (data.exposed.indexOf(`${port[0]}:${port[1] || port[0]}`) < 0) {
            data.exposed.push(`${port[0]}:${port.length === 1 ? port[0] : port[1]}`)
          }
        })

        require('fs').writeFileSync(path.join(cwd, '.workspace.yml'), yaml.safeDump(data))
      }

      console.log('\n  ' + chalk.gray.underline('Exposed Ports'))
      data.exposed.forEach((port) => {
        console.log(`  + ${chalk.cyan.bold(port.split(':')[0])} External ==> ${chalk.cyan(port.split(':')[1])} Internal`)
      })
      console.log(`\n  Type ${chalk.gray('workspace port <external>:<internal>')} to expose another port.\n`)
    } else {
      if (data.exposed.length === 0) {
        return console.log(chalk.gray.bold('\nNo exposed ports.\n'))
      }

      inquirer.prompt([{
        type: 'checkbox',
        name: 'ports',
        message: 'Which port exposure(s) should be ' + chalk.red('removed') + '?',
        choices: function () {
          return data.exposed.map((port) => {
            port = port.split(':')
            return {
              name: `${chalk.cyan.bold(port[0])} ==> ${chalk.cyan(port[1] || port[1])}`,
              value: `${port[0]}:${port[1] || port[0]}`,
              checked: false
            }
          })
        }
      }]).then((answers) => {
        if (answers.ports.length === 0) {
          return console.log(chalk.gray.bold('\nNo changes made.\n'))
        }

        answers.ports.forEach((ports) => {
          let i = data.exposed.indexOf(ports)
          if (i >= 0) {
            data.exposed.splice(i, 1)
          }
        })

        require('fs').writeFileSync(path.join(cwd, '.workspace.yml'), yaml.safeDump(data))
      })
    }
  })
}
