import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

// After a build, list the app's own files for the service worker (public/sw.js)
// to save on install, so the app opens with no connection. The Bible text, notes
// and connections are left out here: they are saved as they are read, or all at
// once from Settings. The version changes whenever any listed file changes.
function offlineList() {
  let outDir
  const skip = /^(bible|bible-[a-z]+|notes|threads|original|evans|gnb)\/|^(sw\.js|precache\.json|third-party-notices\.txt)$/
  return {
    name: 'verbum-offline-list',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    closeBundle() {
      const files = []
      const walk = (dir) => readdirSync(dir).forEach(name => {
        const full = join(dir, name)
        if (statSync(full).isDirectory()) walk(full)
        else {
          const rel = relative(outDir, full).split('\\').join('/')
          if (!skip.test(rel)) files.push(rel)
        }
      })
      walk(outDir)
      files.sort()
      const hash = createHash('sha256')
      files.forEach(f => hash.update(f).update(readFileSync(join(outDir, f))))
      const version = hash.digest('hex').slice(0, 12)
      writeFileSync(join(outDir, 'precache.json'), JSON.stringify({ version, files: ['./', ...files] }))
    },
  }
}


export default defineConfig({
  plugins: [react(), offlineList()],
  build: {
    // maplibre-gl alone is ~1 MB; it is already split into its own lazy chunk.
    chunkSizeWarningLimit: 1100,
  },
  optimizeDeps: {
    include: ['maplibre-gl'],
  },
})
