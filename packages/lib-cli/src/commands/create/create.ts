import * as path from 'path';
import ora from 'ora';
import inquirer from 'inquirer';
import logger from '@lib-cli/logger';
import {
  branchSingle,
  branchTreeShaking,
  repository,
} from '../../constants/resources';
import { CommandArgs } from '../../typing';

const download = require('download-git-repo');

const choices = [
  {
    name: 'single',
    value: branchSingle,
  },
  {
    name: 'tree-shaking',
    value: branchTreeShaking,
  },
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create({ args }: CommandArgs) {
  const name = args[1] || `lib-template-${Date.now()}`;
  const dirname = path.resolve(name);

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'module',
      message: 'Select library template:',
      choices,
    },
  ]);

  const spinner = ora('Pulling . . .').start();

  download(`${repository}#${answer.module}`, dirname, err => {
    if (err) {
      logger.error(err);
      spinner.stop();
    } else {
      spinner.succeed('Success.');
    }
  });
}

export default create;
