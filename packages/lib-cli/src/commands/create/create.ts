// import * as download from 'download-git-repo';
import gitly from 'gitly';
import * as path from 'path';
import { repository } from '../../constants/resources';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create(args: any[]) {
  const dirname = path.resolve(args[0] || `lib-template-${Date.now()}`);

  try {
    const res = await gitly(repository, dirname, {});
    if (res[0]) {
      console.info('[LIB CLI] Pulling success');
    } else {
      console.error('[LIB CLI] Pulling fail');
    }
  } catch (error) {
    console.error(error);
  }
}

export default create;
