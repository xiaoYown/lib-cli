import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import rollupTypescript from '@rollup/plugin-typescript';
import { ENVS } from './constants';

interface Options {
  env: ENVS;
}

const inputOptions = {
  input: path.resolve('./src/index.ts'),
  plugins: [babel({ babelHelpers: 'bundled' }), rollupTypescript()],
};

function getPkg() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), './package.json'), {
      encoding: 'utf8',
    })
  );
}

function getBanner(pkg) {
  return [
    '/*!',
    ` * ${pkg.name} - v${pkg.version}`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ' * http://www.opensource.org/licenses/mit-license',
    ' */',
  ].join('\n');
}

function getTasks() {
  const pkg = getPkg();
  const banner = getBanner(pkg);

  const formats = [
    {
      key: 'main',
      format: 'cjs',
    },
    {
      key: 'module',
      format: 'esm',
    },
    {
      key: 'bundle',
      format: 'iife',
    },
  ].filter(({ key }) => typeof pkg[key] !== 'undefined');

  const tasks = formats.map(item => {
    const outputOptions: rollup.OutputOptions = {
      banner,
      file: path.resolve(pkg[item.key]),
      format: item.format as rollup.ModuleFormat,
      name: 'library',
      sourcemap: true,
      exports: 'auto',
    };
    return outputOptions;
  });

  return tasks;
}

async function build(inputOptions, outputOptions) {
  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);
}

function buildDev(tasks) {
  tasks.forEach(outoutOptions => {
    const watcher = rollup.watch({
      ...inputOptions,
      output: [outoutOptions],
    });
    watcher.on('event', event => {
      switch (event.code) {
        case 'BUNDLE_START':
          console.info(`[LIB CLI] Building ${outoutOptions.format} . . .`);
          break;
        case 'BUNDLE_END':
          console.info(`[LIB CLI] Build ${outoutOptions.format} complete.`);
          break;
        default:
      }
    });
  });
}

function buildProd(tasks) {
  console.info('[LIB CLI] Building . . .');
  tasks.forEach(outoutOptions => {
    build(inputOptions, outoutOptions).then(() => {
      console.info(`[LIB CLI] Build ${outoutOptions.format} complete.`);
    });
  });
}

function compile(options: Options): void {
  const run = options.env === ENVS.DEVELOPMENT ? buildDev : buildProd;
  const tasks = getTasks();
  run(tasks);
}

export default compile;
