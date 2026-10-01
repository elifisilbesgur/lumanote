const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// @noble/hashes 1.8 may route its internal crypto entry through an unexported
// crypto.js subpath under Metro's browser mapping. Fix ONLY this native entry.
// Keep package-exports validation enabled for every other dependency.
const previous = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const from = String(context.originModulePath || '').replace(/\\/g, '/');
  const name = moduleName.replace(/\\/g, '/');
  const native = platform === 'ios' || platform === 'android';
  const scoped = /^@noble\/hashes\/crypto(?:\.js)?$/.test(name) ||
    (from.includes('/@noble/hashes/') && /^(?:\.\/crypto\.js|@noble\/hashes\/crypto(?:\.js)?)$/.test(name)) ||
    /\/@noble\/hashes\/(?:esm\/)?crypto\.js$/.test(name);
  if (native && scoped) return {type:'sourceFile', filePath:path.join(__dirname,'nocturne/NobleCrypto.ts')};
  return previous ? previous(context,moduleName,platform) : context.resolveRequest(context,moduleName,platform);
};
module.exports = config;
