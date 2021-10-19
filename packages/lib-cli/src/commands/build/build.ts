import { ENVS, compile } from '@lib-cli/lib-compile';
import { CommandArgs } from '../../typing';

function build(args: CommandArgs) {
  const { treeShaking } = args.options;
  compile({
    env: ENVS.PRODUCTION,
    treeShaking,
  });
}

export default build;
