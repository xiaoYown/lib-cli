import { ENVS, compile } from '@lib-cli/lib-compile';

function dev(..._args: any[]) {
  compile({
    env: ENVS.DEVELOPMENT,
  });
}

export default dev;
