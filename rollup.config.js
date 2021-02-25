import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import config from 'sapper/config/rollup'
import pkg from './package.json'

const mode = process.env.NODE_ENV
const dev = mode === 'development'
const legacy = !!process.env.SAPPER_LEGACY_BUILD

const onwarn = (warning, _onwarn) =>
    (warning.code === 'CIRCULAR_DEPENDENCY' &&
        /[/\\]@sapper[/\\]/.test(warning.message)) ||
    _onwarn(warning)

export default {
    client: {
        input: config.client.input(),
        output: config.client.output(),
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    'process.browser': true,
                    'process.env.NODE_ENV': JSON.stringify(mode),
                },
            }),
            svelte({
                compilerOptions: {
                    dev,
                    hydratable: true,
                },
                preprocess: [sveltePreprocess({ postcss: true })],
            }),
            resolve({
                browser: true,
                dedupe: ['svelte'],
            }),
            commonjs(),

            legacy &&
                babel({
                    extensions: ['.js', '.mjs', '.html', '.svelte'],
                    exclude: ['node_modules/@babel/**'],
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: '> 0.25%, not dead',
                            },
                        ],
                    ],
                    plugins: [
                        '@babel/plugin-syntax-dynamic-import',
                        [
                            '@babel/plugin-transform-runtime',
                            {
                                useESModules: true,
                            },
                        ],
                    ],
                }),

            !dev &&
                terser({
                    module: true,
                }),
        ],
        preserveEntrySignatures: false,

        onwarn,
    },

    server: {
        input: config.server.input(),
        output: config.server.output(),
        plugins: [
            replace({
                preventAssignment: false,
                values: {
                    'process.browser': false,
                    'process.env.NODE_ENV': JSON.stringify(mode),
                },
            }),
            svelte({
                compilerOptions: {
                    generate: 'ssr',
                    dev,
                },
                preprocess: [sveltePreprocess({ postcss: true })],
            }),
            resolve({
                dedupe: ['svelte'],
            }),
            commonjs(),
        ],
        external: Object.keys(pkg.dependencies).concat(
            // eslint-disable-next-line global-require
            require('module').builtinModules ||
                Object.keys(process.binding('natives')),
        ),
        preserveEntrySignatures: false,

        onwarn,
    },

    serviceworker: {
        input: config.serviceworker.input(),
        output: config.serviceworker.output(),
        plugins: [
            resolve(),
            replace({
                preventAssignment: false,
                values: {
                    'process.browser': true,
                    'process.env.NODE_ENV': JSON.stringify(mode),
                },
            }),
            commonjs(),
            !dev && terser(),
        ],
        preserveEntrySignatures: false,
        onwarn,
    },
}
