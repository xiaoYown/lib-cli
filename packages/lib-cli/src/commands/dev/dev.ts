import { ENVS, compile } from '@lib-cli/lib-compile';
import { CommandArgs } from '../../typing';
import { getDir } from '../../utils';

function dev(args: CommandArgs): void {
  getDir(args.options.treeShaking).then(({ dir, entry }) => {
    compile({
      env: ENVS.DEVELOPMENT,
      dir,
      entry,
    });
  });
}

export default dev;
