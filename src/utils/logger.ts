/* eslint-disable no-console */

type LogFunction = (...args: any[]) => void;

interface Logger {
  log: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  info: LogFunction;
  debug: LogFunction;
}

const isDev = import.meta.env.VITE_NODE_ENV !== "production";

const noop: LogFunction = () => {};

const logger: Logger = {
  log: isDev ? console.log : noop,
  warn: isDev ? console.warn : noop,
  error: isDev ? console.error : noop,
  info: isDev ? console.info : noop,
  debug: isDev ? console.debug : noop,
};

export default logger;
