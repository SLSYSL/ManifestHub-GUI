import { defineConfig } from 'vite';
import purgecss from 'vite-plugin-purgecss';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
    build: {
        sourcemap: false,
        terserOptions: {
            compress: {
                drop_console: true
            },
            output: {
                comments: false, // 移除所有注释
                ascii_only: true, // 非ASCII字符转义
            },
        }
    },

    plugins: [
        purgecss({
            // 配置需要检测的文件
            content: [
                './index.html',
                './src/**/*.js',
            ],
        }),
        createHtmlPlugin({
            minify: true,
        }),
    ],
});