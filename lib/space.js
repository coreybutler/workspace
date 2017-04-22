'use strict'

const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')

module.exports = (callback) => {
  let ws = null
  let dir = path.join(process.cwd(), '.workspace.yml')

  try {
    // Look in local directory
    ws = fs.readFileSync(dir).toString()
  } catch (e) {
    dir = path.join(process.cwd(), '..', '.workspace.yml')

    while (ws === null && dir.split(path.sep).length > 2) {
      try {
        ws = fs.readFileSync(dir).toString()
      } catch (ee) {
        dir = path.join(path.dirname(dir), '..', '.workspace.yml')
      }
    }
  }

  if (!ws) {
    console.log(chalk.red('Cannot find an active workspace.'))

    let choices = []
    fs.readdirSync(process.cwd()).forEach((dir) => {
      try {
        let x = fs.readFileSync(path.join(dir, '.workspace.yml'))

        choices.push({
          name: dir,
          value: path.join(dir, '.workspace.yml')
        })
      } catch (e) {}
    })

    if (choices.length > 0) {
      choices.push({
        name: 'None of These!',
        value: 'none'
      })

      inquirer.prompt([{
        type: 'list',
        name: 'directory',
        default: 'none',
        choices: choices,
        message: 'Did you mean to select one of these projects?'
      }]).then((answers) => {
        if (answers.directory !== 'none') {
          let data = require('js-yaml').safeLoad(fs.readFileSync(answers.directory))

          callback(null, path.resolve(path.dirname(answers.directory)), data)
        }
      })
    } else {
      callback(new Error('No workspaces found.'))
    }
  } else {
    let data = require('js-yaml').safeLoad(ws)

    callback(null, path.resolve(path.dirname(dir)), data)
  }
}
