// import * as download from 'download-git-repo';
import gitly from 'gitly';
import * as path from 'path';
import { repository } from '../../constants/resources';

// const download = require('download-git-repo');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function create(args: any[]) {
  const dirname = path.resolve(args[0] || `lib-template-${Date.now()}`);
  // download(`direct:${repository}`, dirname, err => {
  //   console.log(err ? 'Error' : 'Success');
  // });

  const res = await gitly(repository, dirname, {});
  console.log(res);
}

export default create;
