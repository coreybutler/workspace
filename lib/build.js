'use strict'

let prefs
const path = require('path')
const chalk = require('chalk')
const space = require('./space')

const build = (cwd, tag) => {
  let args = ['build', '-t', tag, '-t', `${tag.split(':')[0]}:latest`, '.']

  console.log(chalk.yellow(`\ndocker ${args.join(' ')}\n`))

  let child = require('child_process').spawn('docker', args, {
    cwd: cwd
  })

  child.stdout.on('data', (data) => {
    process.stdout.write(chalk.gray(data))
  })

  child.stderr.on('data', (data) => {
    process.stdout.write(chalk.red(data))
  })

  child.on('error', (e) => {
    throw e
  })

  child.on('close', () => {
    console.log(chalk.green.bold('\nBUILD COMPLETE'))
  })
}

module.exports = (preferences) => {
  prefs = preferences

  space((err, cwd, data) => {
    if (err) {
      console.log(chalk.red(err.message))
      return
    }

    let tag = data.tag !== 'none' ? data.tag : data.name

    try {
      let pkg = JSON.parse(require('fs').readFileSync(path.join(cwd, data.main, 'package.json')).toString())

      if (pkg.hasOwnProperty('version')) {
        tag += `:${pkg.version}`
      }
    } catch (e) {
      console.log(e)
    }

    build(cwd, tag)
  })
}
