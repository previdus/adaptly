import fs from "node:fs";
import * as nodeModule from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const EXTENSIONS = [".ts", ".tsx", ".mts"];

function resolveTsFile(candidatePath) {
  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return candidatePath;
  }
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(candidatePath + ext)) {
      return candidatePath + ext;
    }
  }
  return null;
}

if (typeof nodeModule.registerHooks === "function") {
  nodeModule.registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.startsWith(".") || specifier.startsWith("/")) {
        const parentPath = context.parentURL
          ? path.dirname(fileURLToPath(context.parentURL))
          : process.cwd();
        const targetPath = specifier.startsWith("/")
          ? specifier
          : path.resolve(parentPath, specifier);
        const resolved = resolveTsFile(targetPath);
        if (resolved) {
          return {
            shortCircuit: true,
            url: pathToFileURL(resolved).href,
          };
        }
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (url.startsWith("file://")) {
        const filePath = fileURLToPath(url);
        if (EXTENSIONS.some((ext) => filePath.endsWith(ext))) {
          const source = fs.readFileSync(filePath, "utf8");
          const transpiled = ts.transpileModule(source, {
            fileName: filePath,
            compilerOptions: {
              module: ts.ModuleKind.ESNext,
              target: ts.ScriptTarget.ES2022,
              jsx: ts.JsxEmit.ReactJSX,
              esModuleInterop: true,
            },
          });
          return {
            shortCircuit: true,
            format: "module",
            source: transpiled.outputText,
          };
        }
      }
      return nextLoad(url, context);
    },
  });
} else {
  nodeModule.register("./ts-hooks.mjs", import.meta.url);
}
