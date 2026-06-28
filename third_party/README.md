# Third Party Directory

This directory contains external dependencies and libraries that are integrated directly as source components.

## Folder Philosophy

All third-party libraries must be cleanly tracked. Any changes, version upgrades, or additions to this folder must be recorded with their respective licenses and upstream references.
Prefer loading libraries via standard CMake subdirectories or Conan package configurations inside the Docker environment where possible.
