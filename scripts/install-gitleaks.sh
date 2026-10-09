#!/usr/bin/env bash
set -euo pipefail
install_dir="${1:-/tmp/cvlora-tools}"
mkdir -p "$install_dir"
archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT
curl -fsSL https://github.com/gitleaks/gitleaks/releases/download/v8.24.2/gitleaks_8.24.2_linux_x64.tar.gz -o "$archive"
printf '%s  %s\n' fa0500f6b7e41d28791ebc680f5dd9899cd42b58629218a5f041efa899151a8e "$archive" | sha256sum -c -
tar -xzf "$archive" -C "$install_dir" gitleaks
