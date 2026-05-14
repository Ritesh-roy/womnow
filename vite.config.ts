// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable Cloudflare Worker build so the output is a plain static SPA
  // that can be deployed on Vercel (or any static host).
  cloudflare: false,
  tanstackStart: {
    // SPA mode: emits a static index.html shell + client bundle in dist/client.
    spa: { enabled: true },
  },
  vite: {
    preview: {
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "swift-referrals.onrender.com",
        "*.vercel.app",
        "*.vercel.com",
        "*.render.com",

        
      ],
    },
  },
});
