import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import rollupTypescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import logger from '@lib-cli/logger';
import { ENVS } from './constants';

interface Options {
  env: ENVS;
  dir?: string;
  entry?: string;
}

interface InputOptions {
  input: string;
  plugins: any[];
}

const getInputOptions = ({ dir, entry }: { dir: string; entry: string }) => ({
  input: path.join(dir, entry),
  plugins: [babel({ babelHelpers: 'bundled' }), rollupTypescript()],
});

const transformInputPotions = (format: string, inputOptions: InputOptions) => {
  const newInputOptions = { ...inputOptions };
  if (format === 'es') {
    newInputOptions.plugins = [...inputOptions.plugins, nodeResolve, dts()];
  }
  return newInputOptions;
};

function getPkg(dir: string) {
  return JSON.parse(
    fs.readFileSync(path.join(dir, './package.json'), {
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

function formatIIFEName(name) {
  return name
    .replace(/[^\w][a-zA-Z]/g, (s: string) => s[1].toUpperCase())
    .replace(/[^\w]/, '')
    .replace(/^\d+/, '');
}

function getTasks({ dir }) {
  const pkg = getPkg(dir);
  const banner = getBanner(pkg);

  const formats = [
    {
      key: 'main',
      format: 'cjs',
    },
    {
      key: 'bundle',
      format: 'iife',
      name: formatIIFEName(pkg.name),
    },
    {
      key: 'module',
      format: 'esm',
    },
  ];
  // 有 esmodule 输出, 添加描述文件输出
  if (typeof pkg.module !== 'undefined') {
    formats.push({
      key: 'types',
      format: 'es',
    });
  }
  const tasks = formats
    .filter(({ key }) => typeof pkg[key] !== 'undefined')
    .map(item => {
      const outputOptions: rollup.OutputOptions = {
        banner,
        name: item.name,
        file: path.join(dir, pkg[item.key]),
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

function buildDev(tasks, inputOptions) {
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
          logger.error(
            `Build ${outoutOptions.format} fail.\n${JSON.stringify(
              event,
              null,
              2
            )}`
          );
          break;
        default:
      }
    });
  });
}

function buildProd(tasks, inputOptions) {
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
  const dir = options.dir || process.cwd();
  const entry = options.entry || './src/index.ts';
  const run = options.env === ENVS.DEVELOPMENT ? buildDev : buildProd;
  const inputOptions = getInputOptions({ dir, entry });
  const tasks = getTasks({ dir });
  run(tasks, inputOptions);
}

export default compile;
