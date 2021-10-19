import { ENVS, compile } from '@lib-cli/lib-compile';
import { CommandArgs } from '../../typing';
import { getDir } from '../../utils';

function build(args: CommandArgs) {
  getDir(args.options.treeShaking).then(({ dir, entry }) => {
    compile({
      env: ENVS.PRODUCTION,
      dir,
      entry,
    });
  });
}

export default build;
