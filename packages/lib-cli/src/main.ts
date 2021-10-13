import { Command } from 'commander';
import { COMMANDS } from './constants/commands';
import create from './commands/create';
import dev from './commands/dev';
import build from './commands/build';

const program = new Command();

const commands = [
  {
    command: COMMANDS.CREATE,
    desc: 'Create a library template.',
    action: create,
  },
  {
    command: COMMANDS.DEV,
    desc: 'Watching files change and compile source code immediately',
    action: dev,
  },
  {
    command: COMMANDS.BUILD,
    desc: 'Build library.',
    action: build,
  },
];

commands.forEach(({ command, desc, action }) => {
  program
    .command(`${command}`)
    .description(desc)
    .action((...args) => {
      action(...args);
    });
});

program.parse(process.argv);
