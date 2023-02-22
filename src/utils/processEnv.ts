export const processEnv = typeof process !== 'undefined' && typeof process.env === 'object' ? process.env ?? {} : {};
