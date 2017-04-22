'use strict'

const space = require('./space')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Shortbus = require('shortbus')

module.exports= (prefs) => {
  space((err, cwd, data) => {
    let tag = data.tag !== 'none' ? data.tag : data.name

    try {
      let pkg = JSON.parse(require('fs').readFileSync(path.join(cwd, data.main, 'package.json')).toString())

      if (pkg.hasOwnProperty('version')) {
        tag += `:${pkg.version}`
      }
    } catch (e) {
      console.log(e)
    }

    let check = require('child_process').execSync(`docker ${['images', '-f', `"reference=${tag.split(':')[0]}*"`].join(' ')}`, {
      cwd: cwd
    }).toString()

    check = check.trim().split('\n')
    check.shift()

    if (check.length === 0) {
      console.log(chalk.gray('\n  Nothing to remove.\n'))
      process.exit(0)
    }

    console.log(chalk.cyan.bold(`\n  The following Docker images will be removed:\n`))
    check.forEach((line) => {
      line = line.split(/\s{1,100}/gi)
      console.log(chalk.cyan(`  - ${line[0]}:${line[1]} (${line[line.length - 1]})`))
    })
    console.log('')

    inquirer.prompt([{
      type: 'confirm',
      name: 'ok',
      default: false,
      message: 'Do you really want to remove the environment and all of it\'s images?'
    }], (answers) => {
      if (answers.ok) {
        check = check.map((line) => {
          return line.split(/\s{1,100}/gi)[2]
        })

        let child = require('child_process').exec(`docker rmi ${check.join(' ')} --force`)

        child.stdout.on('data', (data) => {
          process.stdout.write(chalk.gray(data))
        })

        // child.stderr.on('data', (data) => {
        //   process.stdout.write(chalk.red(data))
        //   process.exit(1)
        // })

        // child.on('error', (e) => {
        //   throw e
        // })

        child.on('close', () => {
          console.log(chalk.green.bold('\n  COMPLETE'))
        })
      }
    })
  })
}
