import { ENVS, compile } from '@lib-cli/lib-compile';
import { CommandArgs } from '../../typing';

function dev(args: CommandArgs): void {
  const { treeShaking } = args.options;
  compile({
    env: ENVS.DEVELOPMENT,
    treeShaking,
  });
}

export default dev;
