import chalk from 'chalk';

enum TYPES {
  debug = 'blue',
  info = 'dim',
  error = 'red',
  success = 'green',
}

const PREFIX = chalk.blue('[LIB CLI]');

class Logger {
  // eslint-disable-next-line class-methods-use-this
  private log(type: TYPES, message: any) {
    console.log(PREFIX, chalk[type](message));
  }

  public debug(message) {
    this.log(TYPES.debug, message);
  }

  public info(message) {
    this.log(TYPES.info, message);
  }

  public success(message) {
    this.log(TYPES.success, message);
  }

  public error(message) {
    this.log(TYPES.error, message);
  }
}

const logger = new Logger();

export default logger;
