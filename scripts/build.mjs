import * as fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import DatabaseSource from './database.source.json' assert { type: 'json' }

const dataObject = {}
const execAsync = async (cmd, opts = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr))
      return resolve(stdout)
    })
  })
}

const processFile = (file) => {
  return fs.readFile(file, 'utf8')
}

const files = await fs.readdir('files')
for (let file of files) {
  DatabaseSource.files[path.parse(file).name] = await processFile(
    'files/' + file
  )
}

const commands = await fs.readdir('commands')
for (let command of commands) {
  DatabaseSource[path.parse(command).name] = await processFile(
    'commands/' + command
  )
}

fs.writeFile('database.json', JSON.stringify(DatabaseSource), 'utf8')
