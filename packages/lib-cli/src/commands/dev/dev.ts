import { ENVS, compile } from '@lib-cli/lib-compile';
import { CommandArgs } from '../../typing';

function dev(args: CommandArgs): void {
  const { treeShaking, sourcemap } = args.options;
  compile({
    env: ENVS.DEVELOPMENT,
    treeShaking,
    sourcemap,
  });
}

export default dev;
