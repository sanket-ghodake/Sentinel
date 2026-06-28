#!/bin/bash
# Setup script to link/copy pre-commit and commit-msg hooks into the Git directory
set -e

# Locate the root of the Git repository
REPO_ROOT=$(git rev-parse --show-toplevel)

# Directory containing git hooks
HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Ensure .git directory exists (if not in a git repo, error out)
if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "Error: .git directory not found. Please run this script from inside a Git repository."
  exit 1
fi

echo "Installing Sentinel git hooks..."

# Set executable permissions on scripts
chmod +x "$REPO_ROOT/scripts/pre-commit.sh"
chmod +x "$REPO_ROOT/scripts/commit-msg.sh"

# Install pre-commit hook
cp "$REPO_ROOT/scripts/pre-commit.sh" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "-> Installed pre-commit hook."

# Install commit-msg hook
cp "$REPO_ROOT/scripts/commit-msg.sh" "$HOOKS_DIR/commit-msg"
chmod +x "$HOOKS_DIR/commit-msg"
echo "-> Installed commit-msg hook."

echo "Sentinel git hooks successfully installed!"
