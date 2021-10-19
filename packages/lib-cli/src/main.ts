#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { COMMANDS } from './constants/commands';
import create from './commands/create';
import dev from './commands/dev';
import build from './commands/build';

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), { encoding: 'utf8' })
);

const program = new Command();

program.version(pkg.verison, '-v', '--version');

const commands = [
  {
    command: `${COMMANDS.CREATE} [name]`,
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

const options = [
  {
    name: '-t, --tree-shaking',
    desc: 'Run with tree-shaking mode',
  },
];

commands.forEach(({ command, desc, action }) => {
  program
    .command(`${command}`)
    .description(desc)
    .action(() => {
      action({
        options: program.opts(),
      });
    });
});
options?.forEach(({ name, desc }) => {
  program.option(name, desc);
});

program.parse(process.argv);
