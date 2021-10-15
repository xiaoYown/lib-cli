import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import rollupTypescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import logger from '@lib-cli/logger';
import { ENVS } from './constants';

interface Options {
  env: ENVS;
}

interface InputOptions {
  input: string;
  plugins: any[];
}

const inputOptions = {
  input: path.resolve('./src/index.ts'),
  plugins: [babel({ babelHelpers: 'bundled' }), rollupTypescript()],
};

const transformInputPotions = (format: string, inputOptions: InputOptions) => {
  const newInputOptions = { ...inputOptions };
  if (format === 'es') {
    newInputOptions.plugins = [...inputOptions.plugins, dts()];
  }
  return newInputOptions;
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
      key: 'types',
      format: 'es',
    },
    {
      key: 'bundle',
      format: 'iife',
    },
  ];
  const tasks = formats
    .filter(({ key }) => typeof pkg[key] !== 'undefined')
    .map(item => {
      const outputOptions: rollup.OutputOptions = {
        banner,
        file: path.resolve(pkg[item.key]),
        format: item.format as rollup.ModuleFormat,
        sourcemap: true,
        exports: 'auto',
      };
      return outputOptions;
    });

  return tasks;
}

let buildingFormats: string[] = [];

const appendBuilding = (format: string) => buildingFormats.push(format);
const removeBuilding = (_format: string) =>
  buildingFormats.splice(
    buildingFormats.findIndex(format => format === _format),
    1
  );
const cleanBuilding = (): void => {
  buildingFormats = [];
};

function buildDev(tasks) {
  tasks.forEach(outoutOptions => {
    const watcher = rollup.watch({
      ...transformInputPotions(outoutOptions.format, inputOptions),
      output: [outoutOptions],
    });
    watcher.on('event', event => {
      switch (event.code) {
        case 'START':
          appendBuilding(outoutOptions.format);
          buildingFormats.length === 1 && logger.info('Building . . .');
          break;
        case 'END':
          removeBuilding(outoutOptions.format);
          if (buildingFormats.length === 0) {
            logger.success('Build complete.');
            buildingFormats = [];
          }
          break;
        case 'ERROR':
          cleanBuilding();
          logger.error(`Build ${outoutOptions.format} fail.`);
          break;
        default:
      }
    });
  });
}

function buildProd(tasks) {
  logger.info('Building . . .');
  async function build(inputOptions, outputOptions) {
    const bundle = await rollup.rollup(inputOptions);

    await bundle.write(outputOptions);
  }

  tasks.forEach(outoutOptions => {
    appendBuilding(outoutOptions.format);
    build(
      transformInputPotions(outoutOptions.format, inputOptions),
      outoutOptions
    ).then(() => {
      removeBuilding(outoutOptions.format);
      if (buildingFormats.length === 0) {
        logger.success('Build complete.');
      }
    });
  });
}

function compile(options: Options): void {
  const run = options.env === ENVS.DEVELOPMENT ? buildDev : buildProd;
  const tasks = getTasks();
  run(tasks);
}

export default compile;
