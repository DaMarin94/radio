// Metro config for the @radio/mobile workspace inside the radio monorepo.
//
// Two things make this non-default:
//   1. Monorepo: deps may be hoisted to the repo-root node_modules, and the
//      shared package lives OUTSIDE this project's folder, so Metro must watch
//      both the workspace root and frontend/shared.
//   2. @radio/shared is raw TypeScript (no build step, no "main"). We point the
//      bare specifier directly at its source entry and let Metro/babel transpile
//      it like any other source file (it's inside watchFolders, so it will).
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const frontendRoot = path.resolve(projectRoot, ".."); // frontend/
const repoRoot = path.resolve(frontendRoot, ".."); // radio/
const sharedRoot = path.resolve(frontendRoot, "shared");
const sharedSrc = path.resolve(sharedRoot, "src");

const config = getDefaultConfig(projectRoot);

// 1. Watch the shared package and the workspace roots so Metro picks up changes
//    and can resolve hoisted dependencies.
config.watchFolders = [frontendRoot, sharedRoot];

// 2. Resolve modules from this project first, then the workspace/repo roots.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(frontendRoot, "node_modules"),
  path.resolve(repoRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = false;

// 3. Map the @radio/shared specifier to its raw-TS source entry. extraNodeModules
//    handles bare imports of the package; resolveRequest handles deep imports
//    like "@radio/shared/foo".
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@radio/shared": sharedSrc,
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@radio/shared") {
    return context.resolveRequest(context, sharedSrc, platform);
  }
  if (moduleName.startsWith("@radio/shared/")) {
    const sub = moduleName.replace("@radio/shared/", "");
    return context.resolveRequest(context, path.join(sharedSrc, sub), platform);
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
