#!/bin/bash
# commit-msg hook to run commitlint inside Docker
set -e

# Ensure docker is available on the host
if ! command -v docker &>/dev/null; then
  echo "Error: docker command not found. Docker is required to run commit-msg checks."
  exit 1
fi

# Locate the root of the Git repository
REPO_ROOT=$(git rev-parse --show-toplevel)

# Build the pre-commit image if it doesn't exist
if [[ "$(docker images -q sentinel-pre-commit:latest 2>/dev/null)" == "" ]]; then
  echo "Sentinel pre-commit Docker image not found. Building it..."
  docker build -t sentinel-pre-commit:latest -f "$REPO_ROOT/docker/pre-commit/Dockerfile" "$REPO_ROOT/docker/pre-commit"
fi

COMMIT_MSG_FILE="$1"
if [ -z "$COMMIT_MSG_FILE" ]; then
  echo "Error: No commit message file provided."
  exit 1
fi

# Convert the path to be relative to the repository root
# Example: /home/user/.../.git/COMMIT_EDITMSG -> .git/COMMIT_EDITMSG
RELATIVE_MSG_FILE=$(realpath --relative-to="$REPO_ROOT" "$COMMIT_MSG_FILE")

# Run commitlint inside the Docker container
docker run --rm \
  -v "$REPO_ROOT:/workspace/sentinel" \
  -w /workspace/sentinel \
  -u "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  sentinel-pre-commit:latest \
  commitlint --edit "/workspace/sentinel/$RELATIVE_MSG_FILE"
