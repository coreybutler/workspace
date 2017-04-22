'use strict'

const space = require('./space')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')

module.exports = (prefs) => {
  space((err, cwd, data) => {
    console.log(chalk.cyan(`Current tag: ${chalk.cyan.bold(data.tag)} ${chalk.gray('- set to "none" if no tag should be used.')}`))

    inquirer.prompt([{
      type: 'input',
      name: 'tag',
      default: data.tag,
      message: 'Tag name:'
    }], function (answer) {
      data.tag = answer.tag
      let output = require('js-yaml').safeDump(data)

      fs.writeFileSync(path.join(cwd, '.workspace.yml'), output)
    })
  })
}
