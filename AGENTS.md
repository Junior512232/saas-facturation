<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Automatic Deployment Policy

Whenever changes or features are implemented:
1. Validate code correctness with `npm run build`.
2. Automatically stage and commit: `git add . && git commit -m "..."`.
3. Automatically push to remote: `git push origin main`.
   (Remote is configured with GitHub PAT, pushing to `main` automatically triggers Vercel production deployment).
4. Inform the user with confirmation of the commit and Vercel deployment.
