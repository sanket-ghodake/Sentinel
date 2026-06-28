#!/bin/bash
# Pre-commit hook to run checks inside Docker
set -e

# Ensure docker is available on the host
if ! command -v docker &>/dev/null; then
  echo "Error: docker command not found. Docker is required to run pre-commit checks."
  exit 1
fi

# Locate the root of the Git repository
REPO_ROOT=$(git rev-parse --show-toplevel)

# Build the pre-commit image if it doesn't exist
if [[ "$(docker images -q sentinel-pre-commit:latest 2>/dev/null)" == "" ]]; then
  echo "Sentinel pre-commit Docker image not found. Building it..."
  docker build -t sentinel-pre-commit:latest -f "$REPO_ROOT/docker/pre-commit/Dockerfile" "$REPO_ROOT/docker/pre-commit"
fi

# Run pre-commit inside the Docker container
# Mount the repository root directory as /workspace/sentinel
# Run with the current user ID and group ID to avoid root-owned file issues
# Mount a workspace-local folder .cache/pre-commit to preserve hook environment caching
docker run --rm \
  -v "$REPO_ROOT:/workspace/sentinel" \
  -w /workspace/sentinel \
  -u "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -e PRE_COMMIT_HOME=/workspace/sentinel/.cache/pre-commit \
  sentinel-pre-commit:latest \
  pre-commit run "$@"
