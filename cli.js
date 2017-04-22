#!/usr/bin/env node

'use strict'

let args = process.argv.splice(2, process.argv.length)
args = args.length === 0 ? ['start'] : args

let cmd = args.shift()

const Preferences = require('preferences')

var prefs = new Preferences('io.author.workspace',{
  docker: {
    username: 'Unknown',
    password: 'Unknown'
  }
})

switch (cmd.trim().toLowerCase()) {
  case 'init':
    require('./lib/init')(prefs)
    return

  case '-i':
  case '--inspect':
  case 'inspect':
    require('./lib/inspect')(prefs)
    return

  case '-b':
  case '--build':
  case '--rebuild':
  case 'rebuild':
  case 'build':
    require('./lib/build')(prefs)
    return

  case '-t':
  case '--tag':
  case 'tag':
    require('./lib/tag')(prefs)
    return

  case '--p':
  case '--pub':
  case '--publish':
  case 'pub':
  case 'publish':
    require('./lib/publish')(prefs)
    return

  case 'run':
  case 'start':
  case 'open':
    require('./lib/run')(prefs)
    return

  case '-c':
  case 'clean':
  case 'clear':
  case '--clear':
  case '--clean':
  case 'nuke':
  case '--nuke':
    require('./lib/clean')(prefs)
    return

  case '-v':
  case '--version':
  case 'version':
    try {
      console.log(JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'package.json'))).version)
    } catch (e) {
      console.log('Error retrieving version.')
    }
    return

  case '-h':
  case '--help':
  case 'help':
  default:
    require('./lib/help')(prefs)
}
