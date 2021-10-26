import * as path from 'path';
import ora from 'ora';
import logger from '@lib-cli/logger';
import {
  branchSingle,
  branchTreeShaking,
  repository,
} from '../../constants/resources';
import { CommandArgs } from '../../typing';

const download = require('download-git-repo');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create({ args, options }: CommandArgs) {
  const name = args[1] || `lib-template-${Date.now()}`;
  const dirname = path.resolve(name);
  const branch = options.treeShaking ? branchTreeShaking : branchSingle;
  const spinner = ora('Pulling . . .').start();

  download(`${repository}#${branch}`, dirname, err => {
    if (err) {
      logger.error(err);
    } else {
      spinner.succeed('Success.');
    }
  });
}

export default create;
