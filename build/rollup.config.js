import path from "path";
import vue from "rollup-plugin-vue";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import auto from "@rollup/plugin-auto-install";
import sass from "rollup-plugin-scss";
import RollupCopy from "rollup-plugin-copy";

import pkg from "../package.json";

const projectRoot = path.resolve(__dirname, "..");

const deps = Object.keys(pkg.dependencies);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const external = function (id) {
  return /^vue/.test(id) || deps.some((k) => new RegExp("^" + k).test(id));
};

export default [
  // esm 打包
  {
    input: path.resolve(projectRoot, "packages/index.ts"),
    external,
    output: {
      format: "esm",
      file: pkg.module,
      exports: "named",
    },
    plugins: [
      auto(),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      nodeResolve({
        customResolveOptions: {
          moduleDirectories: ["node_modules"],
        },
      }),
      sass({ output: path.resolve(projectRoot, "dist/bundle.css") }),
      vue({
        target: "browser",
        css: true,
        exposeFilename: false,
      }),
      typescript({
        tsconfigOverride: {
          include: [
            "packages/*.ts",
            "packages/*.tsx",
            "packages/**/*.ts",
            "packages/**/*.tsx",
          ],
          exclude: [
            "node_modules",
            "utils/**/__tests__/*",
            "src/**/*.ts",
            "src/**/*.tsx",
            "src/**/*.vue",
            "tests/**/*.ts",
            "tests/**/*.tsx",
          ],
        },
        abortOnError: false,
      }),

      babel({
        presets: [
          [
            "@babel/preset-env",
            {
              targets: pkg.browserslist,
            },
          ],
          ["@babel/preset-typescript"],
        ],
        babelHelpers: "runtime",
        exclude: ["node_modules/**"],
        extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"],
        comments: false,
        sourceMap: false,
      }),
      commonjs(),
      terser(),
      RollupCopy({
        targets: [
          {
            src: "packages/styles",
            dest: "dist",
          },
        ],
      }),
    ],
  },
];
