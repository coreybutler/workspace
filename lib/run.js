'use strict'

const space = require('./space')
const command = require('./command')
const chalk = require('chalk')
const path = require('path')
const TaskRunner = require('shortbus')

module.exports = (prefs) => {
  space((err, cwd, data) => {
    if (err) {
      console.log(chalk.red.bold(err.message))
      process.exit(1)
    }

    let tasks = new TaskRunner()
    let tag = data.tag !== 'none' ? data.tag : data.name
    let check = require('child_process').execSync(`docker ${['images', '-f', `"reference=${tag}*"`].join(' ')}`, {
      cwd: cwd
    }).toString()

    check = check.trim().split('\n')
    check.shift()

    if (check.length === 0) {
      console.log(chalk.cyan(`${data.name} environment is not available.`))
      console.log(chalk.cyan.bold(`Building ${data.name} environment automatically.`))

      tasks.add('Building environment', function (next) {
        let child = require('child_process').spawn('ws', ['build'], {
          cwd: cwd,
          stdio: 'inherit'
        })

        child.on('close', next)
      })
    }

    tasks.on('complete', () => {
      console.log(`${chalk.green.bold('\nOpening')} ${chalk.cyan.bold(data.name)} ${chalk.green.bold('workspace. Type')} ${chalk.cyan('exit')} ${chalk.green.bold('to quit.')}`)

      let args = command(cwd, data).split(' ')
      args.shift()

      let child = require('child_process').spawn('docker', args, {
        cwd: cwd,
        stdio: 'inherit'
      })

      let quickexit = true

      child.on('close', () => {
        if (quickexit) {
          let id = require('child_process').execSync(`docker ps -f name=${data.name}`).toString()
          id = id.split('\n')[1].split(/\s{1,100}/gi)[0]
          console.log(`${chalk.yellow.bold('Another session is already open. Now joining that session...')}`)
          require('child_process').execSync(`docker exec -it ${data.name} sh`, {
            cwd: cwd,
            stdio: 'inherit'
          })
        }
      })

      setTimeout(() => {
        quickexit = false
      }, 1000)
    })

    tasks.run(true)
  })
}
