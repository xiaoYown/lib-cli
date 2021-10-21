import path from 'path';
import fs from 'fs';

export const getModules = (): string[] => {
  const files = fs.readdirSync('./src/modules');
  const modules = files
    .filter(item => {
      const stat = fs.statSync(path.resolve('./src/modules', item));
      return stat.isDirectory();
    })
    .map(item => path.resolve('./src/modules', `./${item}/${item}.ts`));
  return modules;
};
