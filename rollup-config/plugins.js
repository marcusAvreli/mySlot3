import injectInnerHTML from './injectInnerHTML.js';
import { watcher, noOpWatcher } from './watcher.js';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';
let dev = process.env.NODE_ENV == 'local';
import sass from 'rollup-plugin-sass';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import copy from 'rollup-plugin-copy';
//import {getPackagePath} from './rollup.utils.js';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
export const plugins = [
	injectInnerHTML(),
	dev ? watcher() : noOpWatcher(),
	dev ? noOpWatcher() : terser({
		module: true,
		keep_classnames: true
	}) ,
		 peerDepsExternal(),
	   
		
       sass(
	     {
        output: 'lib/umd/video-react.css',
		 insert: true,
      }
	   ),
       css({ output:  'lib/umd/bundle.css' }),
	  
    postcss({
		plugins: [
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false, }),
        cssnano(),
		   autoprefixer(),
			
      ],
	  inject: true, // dev 环境下的 样式是入住到 js 中的，其他环境不会注入
				extract: 'lib/umd', // 无论是 dev 还是其他环境这个配置项都不做 样式的抽离
				
      extensions: [ '.css' ],
		
	
        }),
		 resolve(),
        commonjs(
		  {
        include: 'node_modules/**'
      })
];