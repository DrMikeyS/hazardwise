#!/usr/bin/env bash
set -e

# 1. Build already done by pnpm build
BUILD_DIR=build

# 2. Use a temporary worktree linked to gh-pages
TMP_DIR=.gh-pages-tmp
git worktree add -B gh-pages "$TMP_DIR" origin/gh-pages || git worktree add -B gh-pages "$TMP_DIR"

# 3. Copy fresh build
rm -rf "$TMP_DIR"/*
cp -R "$BUILD_DIR"/. "$TMP_DIR"/

# 4. Commit & push
pushd "$TMP_DIR"
  touch .nojekyll          # prevent Jekyll processing
  git add -A
  git commit -m "deploy $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
  git push origin gh-pages
popd

# 5. Clean up
git worktree remove "$TMP_DIR" --force
