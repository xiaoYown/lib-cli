import { ENVS, compile } from '@lib-cli/lib-compile';

function dev(..._args: any[]): void {
  compile({
    env: ENVS.DEVELOPMENT,
  });
}

export default dev;
