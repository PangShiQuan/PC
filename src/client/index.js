const {PATH_BINDING, cssplugins, plugin, version} = require('currentClientDir/config.js');
const {plugins} = require('client/config.js');
const defaultMode = 1;
const DEFAULT_PLUGIN_INDEX = 'HomePage';

function asModule(Client, isEsModule) {
  if (Client.__esModule && isEsModule) {
    return Client.default;
  }
  return Client;
}

function getClient(item, isEsModule = true) {
  try {
    return asModule(require(`currentClientDir/${item}`), isEsModule);
  } catch {}
  try {
    return asModule(require(`defaultClientDir/${item}`), isEsModule);
  } catch {}

  return null;
}

function resolvePlugin(item, itemIndex) {
  if (plugin && plugin[item]) {
    try {
      return asModule(require(`../plugins/${itemIndex}/${version}/${item}${plugin[item]}`), true);
    } catch {
      try {
        return asModule(require(`../plugins/${itemIndex}/${version}/${item}${defaultMode}`), true);
      } catch {
        return function noComponent(){return null};
      }
    }
  }
  else
    try {
        return asModule(require(`../plugins/${itemIndex}/${version}/${item}${defaultMode}`), true);
      } catch {
          return function noComponent(){return null};
      }
}

function resolveCssPlugin(item, itemIndex) {
  try {
    return asModule(require(`../styles/${itemIndex}/${version}/${item}${defaultMode}.less`), true);
  } catch {}

  return null;
}

function getPlugin(item) {
  return resolvePlugin(
    item,
    (plugins && plugins[item]) || item,
  );
}

function getCssPlugin(item) {
  return resolveCssPlugin(
    item,
    (cssplugins && cssplugins[item]) || item,
  );
}

// function getPluginByPath(item) {
//   const pluginByPath = {
//     all: resolvePlugin(item, DEFAULT_PLUGIN_INDEX),
//   };
//   if (!PATH_BINDING.PLUGIN || !PATH_BINDING.PLUGIN[item]) return pluginByPath;

//   Object.entries(PATH_BINDING.PLUGIN[item] || {}).forEach(
//     ([path, itemIndex]) => {
//       pluginByPath[path] = resolvePlugin(item, itemIndex);
//     },
//   );

//   return pluginByPath;
// }

const moduleResolve = {
  client: getClient,
  plugin: getPlugin,
  cssplugin: getCssPlugin,
  // pluginByPath: getPluginByPath,
};

export default moduleResolve;
