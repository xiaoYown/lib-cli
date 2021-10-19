import path from 'path';
import fs from 'fs';
import logger from '@lib-cli/logger';
import * as inquirer from 'inquirer';

const getModules = () => {
  const files = fs.readdirSync('./src/modules');
  const modules = files
    .filter(item => {
      const stat = fs.statSync(path.resolve('./src/modules', item));
      return stat.isDirectory();
    })
    .map(item => {
      const dir = path.resolve('./src/modules', item);
      const pkg = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), { encoding: 'utf8' })
      );
      return {
        dir,
        name: pkg.name,
      };
    });
  return modules;
};

interface Result {
  dir: string;
  entry?: string;
}

export const getDir = (treeShaking: boolean): Promise<Result> =>
  new Promise((resolve, reject) => {
    if (treeShaking) {
      const modules = getModules();
      const choices = modules.map(item => ({
        name: item.name,
        value: item.dir,
      }));
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'module',
            message: '选择监听模块',
            choices,
          },
        ])
        .then(answers => {
          resolve({ dir: answers.module, entry: './index.ts' });
        })
        .catch(error => {
          if (error.isTtyError) {
            logger.error(
              'Prompt could not be rendered in the current environment'
            );
          } else {
            logger.error(`\n${JSON.stringify(error, null, 2)}`);
          }
          reject(error);
        });
    } else {
      resolve({ dir: process.cwd() });
    }
  });
