// import * as download from 'download-git-repo';
import gitly from 'gitly';
import * as path from 'path';
import logger from '@lib-cli/logger';
import { repository } from '../../constants/resources';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create(args: any[]) {
  const dirname = path.resolve(args[0] || `lib-template-${Date.now()}`);

  logger.info('Pulling . . .');
  try {
    const res = await gitly(repository, dirname, {});
    if (res[0]) {
      logger.success('Pulling success');
    } else {
      logger.error('Pulling fail');
    }
  } catch (error) {
    logger.error(error);
  }
}

export default create;
