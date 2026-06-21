#!/bin/bash
# Quick script to push the juan/scaffolding branch and open a PR

cd "$(dirname "$0")"

echo "Pushing juan/scaffolding to GitHub..."
git push -u origin juan/scaffolding

echo ""
echo "✅ Branch pushed!"
echo "Now open a PR at:"
echo "https://github.com/pecezon/UCBerkleyHackathon/compare/juan/scaffolding"
echo ""
echo "Copy PR_DESCRIPTION.md as the PR body."
