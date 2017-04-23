'use strict'

const path = require('path')
const chalk = require('chalk')

module.exports = (cwd, data) => {
  let tag = data.tag !== 'none' ? data.tag : data.name

  try {
    let pkg = JSON.parse(require('fs').readFileSync(path.join(cwd, data.main, 'package.json')).toString())

    if (pkg.hasOwnProperty('version')) {
      tag += `:${pkg.version}`
    }
  } catch (e) {}

  let cmd = [
    'docker',
    'run', '--rm', '-it',
    '--name', data.name,
    '-v', `${path.join(cwd, data.main)}:/app`
  ]

  if (data.hasOwnProperty('exposed')) {
    data.exposed.forEach((port) => {
      cmd.push('-p')
      cmd.push(port)
    })
  }

  cmd.push(tag)
  cmd.push('sh')

  if (data.hasOwnProperty('launch')) {
    if (Array.isArray(data.launch)) {
      cmd = data.launch
    } else if (data.launch.trim().toLowerCase() !== 'default') {
      cmd = data.launch.split(' ')
    }
  }

  return cmd.join(' ')
}
