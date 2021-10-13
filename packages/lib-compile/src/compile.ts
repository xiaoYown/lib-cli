import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import rollupTypescript from '@rollup/plugin-typescript';
import { ENVS } from './constants';

// const isProduction = process.env.NODE_ENV === 'production';

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), './package.json'), {
    encoding: 'utf8',
  })
);

const banner = [
  '/*!',
  ` * ${pkg.name} - v${pkg.version}`,
  ` * ${pkg.name} is licensed under the MIT License.`,
  ' * http://www.opensource.org/licenses/mit-license',
  ' */',
].join('\n');

interface Options {
  env: ENVS;
}

const inputOptions = {
  input: path.resolve('./src/index.ts'),
  plugins: [rollupTypescript()],
};

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

async function build(inputOptions, outputOptions) {
  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);
}

function compile(options: Options): void {
  if (options.env === ENVS.DEVELOPMENT) {
    tasks.forEach(outoutOptions => {
      const watcher = rollup.watch({
        ...inputOptions,
        output: [outoutOptions],
        watch: {
          chokidar: {
            alwaysStat: true,
            atomic: true,
          },
        },
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
  } else {
    tasks.forEach(outoutOptions => {
      build(inputOptions, outoutOptions);
    });
  }
}

export default compile;
