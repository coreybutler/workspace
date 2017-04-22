'use strict'

const space = require('./space')
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Shortbus = require('shortbus')

module.exports = (prefs) => {
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

    let latest = false
    check = check.map((img) => {
      let data = img.split(/\s{1,100}/gi)

      if (data[1] === 'latest') {
        latest = true
      }

      return {
        version: data[1],
        id: data[2]
      }
    })

    let tasks = new Shortbus()

    if (check.length === 0) {
      tasks.add((next) => {
        console.log(chalk.red('There are no environments.'))
        inquirer.prompt([{
          type: 'confirm',
          name: 'make',
          default: true,
          message: 'Should the environment be built now?'
        }]).then((answer) => {
          if (answer.make) {
            console.log(chalk.cyan.bold('Building environment automatically...'))
            require('child_process').exec('workspace build', {
              cwd: cwd
            }, () => {
              this.abort()
              require('child_process').exec('workspace publish', {
                cwd: cwd
              }, () => {
                process.exit(0)
              })
            })
          } else {
            process.exit(0)
          }
        })
      })
    }

    tasks.add(() => {
      console.log(chalk.cyan(`\n  Publishing as ${tag}\n`))
    })

    // if (!latest) {
    tasks.add((next) => {
      inquirer.prompt([{
        type: 'confirm',
        name: 'latest',
        default: true,
        message: 'Should this also be tagged as the "latest" version of the environment?'
      }]).then((answer) => {
        if (answer.latest) {
          latest = true
          require('child_process').exec(`docker tag ${check[0].id} ${tag.split(':')[0]}:latest`, next)
        } else {
          next()
        }
      })
    })
    // }

    const push = (tag, callback) => {
      let args = ['docker', 'push', tag]
      let child = require('child_process').exec(args.join(' '))

      child.stdout.on('data', (data) => {
        process.stdout.write(chalk.gray(data))
      })

      child.stderr.on('data', (data) => {
        process.stdout.write(chalk.red(data))
        process.exit(1)
      })

      child.on('error', (e) => {
        throw e
      })

      child.on('close', callback)
    }

    tasks.on('complete', () => {
      push(tag, () => {
        if (latest) {
          push(`${tag.split(':')[0]}:latest`, () => {
            console.log(chalk.green.bold('\n  PUBLISH COMPLETE'))
          })
        } else {
          console.log(chalk.green.bold('\n  PUBLISH COMPLETE'))
        }
      })
    })

    tasks.run(true)
  })
}
