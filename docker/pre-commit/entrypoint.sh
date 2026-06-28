#!/bin/bash
set -e

# Configure git to trust the workspace directory so that running git commands
# (like git diff, git status, etc.) inside the container under different UIDs doesn't fail.
git config --global --add safe.directory /workspace/sentinel

# Execute the passed command
exec "$@"
