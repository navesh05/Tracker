#!/usr/bin/env bash
set -euo pipefail
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
printf '\nPython tooling environment ready.\nActivate with: source .venv/bin/activate\n'
