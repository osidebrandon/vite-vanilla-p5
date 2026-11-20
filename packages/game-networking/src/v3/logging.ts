export const createLogger = (namespace: string) => {
  return {
    log: (message: string) => {
      console.log(`[${namespace}] ${message}`);
    },
  };
};
