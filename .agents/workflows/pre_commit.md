---
name: pre-commit
description: Run pre-commit checks on staged or all files inside the Docker container
---

# Workflow: pre-commit

This workflow guides you through running the Dockerized formatting and linting suite.

## Steps

1. **Verify Docker Status**: Ensure that the Docker daemon is running on your host system.
2. **Execute Staged Checks**: Run checks on currently staged changes before committing:

   ```bash
   bash scripts/pre-commit.sh
   ```

3. **Execute Full Repository Scan**: Run checks on all files in the repository:

   ```bash
   bash scripts/pre-commit.sh --all-files
   ```

4. **Re-stage Auto-Formatted Changes**: If formatters (`prettier`, `shfmt`, `clang-format`) modify files in-place:
   - Check the changes using `git diff`.
   - Stage the changes: `git add <files>`.
   - Run `bash scripts/pre-commit.sh` again to ensure all tests pass.
