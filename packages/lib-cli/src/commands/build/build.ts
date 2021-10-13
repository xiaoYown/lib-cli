import { ENVS, compile } from '@lib-cli/lib-compile';

function build(..._args: any[]) {
  compile({
    env: ENVS.PRODUCTION,
  });
}

export default build;
