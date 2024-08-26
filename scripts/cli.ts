import { Command } from 'commander'
import { deployApp, setupProjectAndDomain } from './pipeline/deployApp'
const program = new Command()

program.name('krone-sh').description('CLI for Krone.sh')

program
  .command('deploy')
  .description('Deploy an app')
  .argument('<appName>', 'The name of the app to deploy')
  .action((appName) => {
    deployApp({ appName })
  })

program
  .command('setup')
  .description('Setup a project and domain')
  .argument('<appName>', 'The name of the app to setup')
  .action((appName) => {
    setupProjectAndDomain({ appName })
  })

program.parse(process.argv)
