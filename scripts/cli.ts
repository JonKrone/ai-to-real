import { Command } from 'commander';
import { deployApp } from './pipeline/deployApp';
const program = new Command()

program.name('krone-sh')
  .description('CLI for Krone.sh')

program.command('deploy')
  .description('Deploy an app')
  .argument('<appName>', 'The name of the app to deploy')
  .action((appName) => {
    deployApp({appName})
  })

program.parse(process.argv)
