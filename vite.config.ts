import { defineConfig, type PluginOption } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path';
import { $ } from 'execa';
import path from 'node:path';
import fs from 'node:fs/promises';

const neuConfig = JSON.parse(await fs.readFile('neutralino.config.json', 'utf8'));
let launchedNeutralino = false;

const neuCustom = (): PluginOption => [{
  name: "vite-plugin-neutralino:serve",
  apply: 'serve',
  enforce: 'post',
  async configureServer(server) {
    server.httpServer?.once('listening', async () => {
      if (launchedNeutralino) {
        return;
      }
      const address = server.httpServer?.address();
      if (!address || typeof address === 'string') {
        throw new Error('Failed to get server address');
      }
      await $`neu run -- --url=http://127.0.0.1:${address.port} --window-enable-inspector=true`;
      launchedNeutralino = true;

      const authFile = path.resolve(process.cwd(), '.tmp', 'auth_info.json');
      let retries = 0;
      while (retries < 10) {
        try {
          await fs.access(authFile);
          break;
        } catch {
          await new Promise(r => setTimeout(r, 300));
          retries++;
        }
      }
      if (retries === 10) {
        console.warn('[vite] Neutralino auth file not ready, injection may fail.');
      }
    })
  }
},
{
  name: 'vite-plugin-neutralino:inject',
  enforce: 'post',
  async transformIndexHtml(html, ctx) {
    if (ctx.server) {
      const authFile = path.resolve(process.cwd(), '.tmp', 'auth_info.json');
      try {
        const content = await fs.readFile(authFile, 'utf-8');
        const { nlPort } = JSON.parse(content);
        if (nlPort) {
          return [
            {
              tag: 'script',
              attrs: {
                src: `http://localhost:${nlPort}/__neutralino_globals.js`,
              },
              injectTo: 'head-prepend',
            },
          ];
        }
      } catch {
        console.warn('[vite] Could not inject Neutralino script, auth file missing.');
      }
      return [];
    } else {
      return [
        {
          tag: 'script',
          attrs: {
            src: '__neutralino_globals.js',
          },
          injectTo: 'head-prepend',
        },
      ];
    }
  }
}, {
  name: 'vite-plugin-neutralino:build',
  apply: 'build',
  enforce: 'post',
  async closeBundle() {
    console.log('[vite] Vite build done, starting Neutralino build...');
    try {
      await $`neu build`;
      console.log(`Neutralino build completed.`);
    } catch (error) {
      console.error('[vite] Neutralino build failed:', error);
      throw error;
    }
  }
}]

export default defineConfig({
  root: resolve(import.meta.dirname, 'resources'),
  plugins: [neuCustom(), svelte()],
  server: {
    host: '127.0.0.1',
    open: false
  },
})
