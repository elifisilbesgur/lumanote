#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
MODE="${1:-}"
case "$MODE" in ac|kapat) ;; *) echo 'Kullanım: bash TEST_JETONLARI.command ac (veya kapat)'; exit 1;; esac
command -v npx >/dev/null 2>&1 || { echo 'npx bulunamadı.'; exit 1; }
export LUMA_TEST_ROOT="$ROOT" LUMA_TEST_MODE="$MODE"
npx --yes --package=node@24 --call 'node "$LUMA_TEST_ROOT/tools/toggle-test-coins.cjs" "$LUMA_TEST_MODE" && cd "$LUMA_TEST_ROOT" && node node_modules/expo/bin/cli start --go --clear --port 8098'
