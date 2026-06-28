# Scripts Directory

This directory contains automation scripts used for bootstrap, validation, cross-compilation, packaging, and clean-up.

## Folder Philosophy

All scripts must run in standard Linux shells inside the docker containers, or act as host-side entry points that spin up the docker containers. No script is permitted to depend on local utilities installed directly on the host system.
