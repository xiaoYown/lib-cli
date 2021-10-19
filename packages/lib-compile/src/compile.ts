import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import rollupTypescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import logger from '@lib-cli/logger';
import { ENVS } from './constants';
import { getModules } from './utils';

interface Options {
  env: ENVS;
  treeShaking: boolean;
}

interface InputOptions {
  input: string | string[];
  plugins: any[];
}

/** 获取当前目录 inputOptions */
const getInputOptions = ({ dir, entry }: { dir: string; entry: string }) => ({
  input: path.join(dir, entry),
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    rollupTypescript(),
    nodeResolve,
  ],
});

/** 根据输出个数配置 inputOpitons */
const transformInputPotions = (
  format: string,
  inputOptions: InputOptions,
  treeShking: boolean
) => {
  const newInputOptions = { ...inputOptions };
  if (format === 'es') {
    newInputOptions.plugins = [...inputOptions.plugins, dts()];
  }
  if (format === 'esm' && treeShking) {
    newInputOptions.input = [newInputOptions.input as string, ...getModules()];
  }
  return newInputOptions;
};

/** 读取 package 信息 */
function getPkg(dir: string) {
  return JSON.parse(
    fs.readFileSync(path.join(dir, './package.json'), {
      encoding: 'utf8',
    })
  );
}

/** 生成 bannber */
function getBanner(pkg) {
  return [
    '/*!',
    ` * ${pkg.name} - v${pkg.version}`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ' * http://www.opensource.org/licenses/mit-license',
    ' */',
  ].join('\n');
}

/** 格式化 iife 输出全局命名 */
function formatIIFEName(name) {
  return name
    .replace(/[^\w][a-zA-Z]/g, (s: string) => s[1].toUpperCase())
    .replace(/[^\w]/, '')
    .replace(/^\d+/, '');
}

/** 获取输出任务列表 */
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
      dir: '',
    },
  ];
  // esm 模块输出处理
  if (typeof pkg.module !== 'undefined') {
    // tree-shaking 输出目录
    formats[2].dir = path.join(dir, pkg.module, '..');
    // 有 esmodule 输出, 添加描述文件输出
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
        dir: item.dir,
        file: item.dir ? undefined : path.join(dir, pkg[item.key]),
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

function buildDev(tasks, inputOptions, treeShking) {
  tasks.forEach(outoutOptions => {
    const watcher = rollup.watch({
      ...transformInputPotions(outoutOptions.format, inputOptions, treeShking),
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

function buildProd(tasks, inputOptions, treeShking) {
  logger.info('Building . . .');
  async function build(inputOptions, outputOptions) {
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
  }

  tasks.forEach(outoutOptions => {
    appendBuilding(outoutOptions.format);
    build(
      transformInputPotions(outoutOptions.format, inputOptions, treeShking),
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
  const { env, treeShaking } = options;
  const dir = process.cwd();
  const entry = './src/index.ts';
  const run = env === ENVS.DEVELOPMENT ? buildDev : buildProd;
  const inputOptions = getInputOptions({ dir, entry });
  const tasks = getTasks({ dir });
  run(tasks, inputOptions, treeShaking);
}

export default compile;
