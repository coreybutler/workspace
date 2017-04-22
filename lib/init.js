'use strict'

const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
let output = ''
let prefs

const question = []

question.push({
  type: 'input',
  name: 'name',
  message: 'Environment name:',
  validate: function (answer) {
    return /[A-Za-z0-9\_\-]{1,100}/i.test(answer.trim()) ? true : chalk.red.bold('May only have alphanumeric characters, underscores, and hyphens. Cannot be blank.')
  }
})

question.push({
  type: 'confirm',
  name: 'overwrite',
  message: function (answers) {
    return `A directory for ${chalk.magenta.bold(answers.name)} already exists. Overwrite?`
  },
  default: false,
  when: function (answers) {
    if (!/[A-Za-z0-9\_\-]{1,100}/i.test(answers.name)) {
      return false
    }

    let dir = /[A-Za-z0-9\_\-]{1,100}/i.exec(answers.name)

    if (dir.length > 1) {
      dir = dir[1]
    } else {
      dir = dir.input
    }

    try {
      output = path.join(process.cwd(), dir)
      require('fs').accessSync(output, require('fs').R_OK)
      return true
    } catch (e) {
      return false
    }
  }
})

question.push({
  type: 'list',
  name: 'image',
  message: 'Which environment base shall be created?',
  default: 'author/workspace',
  when: function (answers) {
    if (answers.hasOwnProperty('overwrite') && !answers.overwrite) {
      process.exit(0)
    }

    return true
  },
  choices: function () {
    let choices = [{
      name: chalk.magenta.bold('Standard Workspace (author/workspace ==> Latest Node.js on Alpine Linux)'),
      value: 'author/workspace'
    }]
    let done = this.async()
    let req = require('https')
    let raw = ''

    req.get('https://raw.githubusercontent.com/docker-library/official-images/master/library/node', (res) => {
      res.on('data', (data) => raw += data).on('end', () => {
        raw = raw.split('\n').filter((line) => {
          return line.indexOf('Tags:') >= 0
            && line.toLowerCase().indexOf('onbuild') < 0
            && line.toLowerCase().indexOf('slim') < 0
        }).map((line) => {
          let val = line.replace(/Tags:\s{0,100}/gi, '').trim().split(',').shift()
          let nameParts = val.split('-')
          let name = nameParts[0]

          name = `${name} running ${nameParts[1] || 'jessie' }`

          return {
            name: `Node.js v${name}`,
            value: val
          }
        })

        raw.push({
          name: chalk.yellow('Other Docker Image (you\'ll be prompted for it)'),
          value: 'other'
        })

        done(choices.concat(raw))
      })
    })
  }
})

question.push({
  type: 'input',
  name: 'image',
  when: function (answers) {
    return answers.image === 'other'
  },
  message: 'Please specify the alternative Docker image:',
  default: 'author/workspace'
})

question.push({
  type: 'input',
  name: 'cwd',
  message: 'Which directory will contain the working code base?',
  default: './app',
  validate: function (answer) {
    if (answer === '.' || answer === './' || answer === '/' || answer === '.\\' || answer === '.\\') {
      return chalk.red.bold('Must provide a subdirectory name.')
    }

    return true
  }
})

question.push({
  type: 'input',
  name: 'tag',
  message: `${chalk.cyan.bold('Optional')} Docker tag (ex: myregistry/imagename):`,
  validate: function (answer) {
    if (answer.trim().length === 0) {
      return true
    }

    return /[A-Za-z0-9\_\-]{4,100}\/[A-Za-z0-9\_\-]+/i.test(answer) ? true : chalk.red.bold('Must provide a valid Docker tag.')
  }
})

question.push({
  type: 'list',
  name: 'envs',
  message: 'Which environment variables would you like to configure?',
  default: 'none',
  when: function () {
    console.log(chalk.cyan('\n  Workspaces support runtime and hard-coded environment variables.\n  You will now have a choice to create both types.\n'))
    return true
  },
  choices: [{
    name: 'None',
    value: 'none'
  }, {
    name: 'Hardcoded Static Variables (Dockerfile)',
    value: 'docker'
  }, {
    name: 'Dynamic Variables (env.json). Requires Node.js and localenvironment npm module.',
    value: 'node'
  }, {
    name: 'Both',
    value: 'both'
  }]
})

const complete = (answers) => {
  let DOCKER_ENV = ''

  if (answers.env_docker) {
    Object.keys(answers.env_docker).forEach((key) => {
      DOCKER_ENV += `ENV ${key} ${answers.env_docker[key]}\n`
    })
  }

  let DOCKERFILE = `
    FROM ${answers.image}
    ${DOCKER_ENV}
    WORKDIR /app
    CMD ["sh"]
  `.replace(/^\s{2,1000}/gim, '').trim()

  let DOCKERIGNORE = `
    env.json
    ${path.join('./', answers.cwd)}/env.json
    .*
  `.replace(/^\s{2,1000}/gim, '').trim()

  let GITIGNORE = `
    env.json
    ${path.join('./', answers.cwd)}/env.json
    .*
    !.dockerignore
    !.gitignore
    !*.yml
    !Dockerfile
  `.replace(/^\s{2,1000}/gim, '').trim()

  let README = `
# ${answers.name}

To operate this workspace:

\`\`\`
npm install -g workspace
workspace start
\`\`\`
  `.trim()

  let WS = `
    name: ${answers.name}
    image: ${answers.image}
    main: ${answers.cwd}
    tag: ${answers.tag.length === 0 ? 'none' : answers.tag}
  `.replace(/^\s{2,1000}/gim, '').trim()

  fs.emptyDir(path.resolve(path.join(output, answers.cwd)), () => {
    fs.writeFileSync(path.join(output, 'Dockerfile'), DOCKERFILE.trim())
    fs.writeFileSync(path.join(output, '.dockerignore'), DOCKERIGNORE.trim())
    fs.writeFileSync(path.join(output, '.gitignore'), GITIGNORE.trim())
    fs.writeFileSync(path.join(output, 'README.md'), README.trim())
    fs.writeFileSync(path.join(output, '.workspace.yml'), WS.trim())

    if (answers.env_local) {
      let index = `
        'use strict'
        require('localenvironment')
        console.log('Environment Variables:\\n', process.env)
      `.replace(/^\s{2,1000}/gim, '').trim()

      fs.writeFileSync(path.join(output, answers.cwd, 'index.js'), index)
      fs.writeFileSync(path.join(output, answers.cwd, 'env.json'), JSON.stringify(answers.env_local, null, 2))
    } else {
      let index = `
        'use strict'
        console.log('Environment Variables:\\n', process.env)
      `.replace(/^\s{2,1000}/gim, '').trim()

      fs.writeFileSync(path.join(output, answers.cwd, 'index.js'), index)
    }

    if (build) {
      let cmd = ['build', '-t', (answers.tag.trim().length > 0 ? answers.tag : answers.name), '.']

      let child = require('child_process').spawn('docker', cmd, {
        cwd: output
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

      child.on('close', (code) => {
        console.log('Type ' + chalk.green('workspace run') + ' to launch the workspace.')
      })
    }
  })
}

const addEnv = (list, callback) => {
  inquirer.prompt([{
    type: 'input',
    name: 'key',
    message: 'Environment Variable Name:'
  }, {
    type: 'input',
    name: 'value',
    message: 'Value:'
  }, {
    type: 'confirm',
    name: 'askAgain',
    default: true,
    message: chalk.magenta.bold('Add another?')
  }], function (answers) {
    list[answers.key] = answers.value

    if (answers.askAgain) {
      addEnv(list, callback)
    } else {
      callback()
    }
  })
}

let docker_env = {}
let local_env = {}
let build = false

module.exports = (preferences) => {
  prefs = preferences
  inquirer.prompt(question, (answers) => {
    let Shortbus = require('shortbus')
    let tasks = new Shortbus()
    let env = answers.envs.trim()

    if (env !== 'none') {
      if (env === 'both' || env === 'docker') {
        tasks.add((next) => {
          console.log(chalk.cyan.bold('\n  Hardcoded Static Variables (Dockerfile):'))
          addEnv(docker_env, next)
        })
      }

      if (env === 'both' || env === 'node') {
        tasks.add((next) => {
          console.log(chalk.cyan.bold('\n  Dynamic Variables (env.json). Requires Node.js and localenvironment npm module.'))
          addEnv(local_env, next)
        })
      }
    }

    tasks.add((next) => {
      console.log('')
      Object.keys(answers).forEach((key) => {
        console.log(`  - ${chalk.yellow(key)}: ${answers[key].length === 0 ? chalk.gray('<none>') : chalk.bold(answers[key])}`)
      })
      console.log('')

      if (Object.keys(docker_env).length > 0) {
        console.log(chalk.cyan.bold('  Docker Static Environment Variables:'))
        Object.keys(docker_env).forEach((key) => {
          if (key.trim().length > 0) {
            console.log(`  - ${chalk.cyan(key)}: ${docker_env[key].length === 0 ? chalk.gray('<none>') : chalk.bold(docker_env[key])}`)
          }
        })

        console.log('')
      }

      if (Object.keys(local_env).length > 0) {
        console.log(chalk.cyan.bold('  Dynamic Environment Variables:'))
        Object.keys(local_env).forEach((key) => {
          if (key.trim().length > 0) {
            console.log(`  - ${chalk.cyan(key)}: ${local_env[key].length === 0 ? chalk.gray('<none>') : chalk.bold(local_env[key])}`)
          }
        })

        console.log('')
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'ok',
        message: 'Is this correct?',
        default: true
      }, {
        type: 'confirm',
        name: 'build',
        message: 'Build the environment?',
        default: true
      }], function (ans) {
        if (ans.ok) {
          build = ans.build
          next()
        } else {
          process.exit(0)
        }
      })
    })

    tasks.on('complete', () => {
      Object.keys(docker_env).length > 0 && (answers.env_docker = docker_env)
      Object.keys(local_env).length > 0 && (answers.env_local = local_env)
      complete(answers)
    })

    tasks.run(true)
  })
}
