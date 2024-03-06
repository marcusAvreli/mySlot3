//import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
//import typescript from 'rollup-plugin-typescript';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';
import commonjs from 'rollup-plugin-commonjs';
//import { plugins as inPlugins} from './rollup-config/plugins.js';
import { plugins } from './rollup-config/plugins.js';
import { getModules } from './rollup-config/getModules.js';
//https://github.com/sakshamgupta912/CollabSphereFrontEnd/tree/d936ea0b2b3461d3ad077da552c9b871d895e92a/Index
console.log(`
-------------------------------------
Rollup building bundle for ${process.env.BABEL_ENV}
-------------------------------------
`)
//https://github.com/GoogleChromeLabs/ProjectVisBug/tree/667971b4370acf125ba982c9ac6e5e63155e5a85
//https://github.com/rollup/rollup-plugin-typescript/issues/45
///https://github.com/zooplus/zoo-web-components/blob/b00c5286829d324eee2f99f855964e4cdac783d4/rollup.config.js
//https://stackoverflow.com/questions/58337333/how-to-pass-env-variable-to-rollup-config-js-via-npm-cli
//https://www.freecodecamp.org/news/how-to-use-sass-with-css/
//https://github.com/sin-group/base-ui/blob/6ee55b10309c4eb653454eefcd91315302f0fcc9/rollup.config.js
//https://www.learnwithjason.dev/blog/learn-rollup-js/
//npm i -S myslot3@file:../../nodeJSDev/mySlot3
const extensions = ['.js', '.ts', '.tsx'];
let dev = process.env.NODE_ENV == 'local';
const modules = !dev ? getModules() : [];
const getFileName = (version = "es5", isMin = false) => {
	const base = "index";
	const ext = isMin ? "min.js" : "js";
	if (version === "es6") {
		return [base, "es5", ext].filter(Boolean).join(".");
	}
	return [base, ext].filter(Boolean).join(".");
};


const getConfig = () => {
	const isMinify = process.env.OUT_STYLE === "min",
		fileName = getFileName(process.env.NODE_ENV, isMinify);
			return { fileName };
};
const { fileName } = getConfig();

export default [
	{
		input: 'src/index.js',
		output: [
			{
				sourcemap: true,
				file: `${fileName}`,
				format: 'umd',
				exports: "named",
				dir: dev ? 'lib/umd' : 'dist',
				name: 'myzoo'
			}
			
		],
		
		plugins: plugins
		
  
		
		
	},
		...modules
	
	
];

//import babel from 'rollup-plugin-babel';
//import commonjs from 'rollup-plugin-commonjs';
//import typescript from 'rollup-plugin-typescript';
//import eslint from 'rollup-plugin-eslint';
//import angular from 'rollup-plugin-angular';
// PostCSS plugins
//import simplevars from 'postcss-simple-vars';
//import nested from 'postcss-nested';
//import cssnext from 'postcss-cssnext';
//import cssnano from 'cssnano';
//import scss from "rollup-plugin-scss";
//import postcssPresetEnv from 'postcss-preset-env';
//import autoprefixer from 'autoprefixer';
//import sass from 'rollup-plugin-sass';
//import pkg from './package.json'
//import string from 'rollup-plugin-string';
//import postcssImport from "postcss-import";