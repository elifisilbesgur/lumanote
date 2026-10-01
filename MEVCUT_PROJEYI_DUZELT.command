#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
TARGET="${1:-$HOME/Desktop/LumaNote_Yasayan_Bahce}"
command -v npx >/dev/null 2>&1 || { echo 'npx bulunamadı. Proje değiştirilmedi.'; exit 1; }
command -v zip >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1 || { echo 'Kod yedeği için ZIP araçları gerekli.'; exit 1; }
export LUMA_REPAIR_ROOT="$ROOT" LUMA_REPAIR_TARGET="$TARGET"
npx --yes --package=node@24 --call 'node "$LUMA_REPAIR_ROOT/tools/repair-existing.cjs" "$LUMA_REPAIR_TARGET" && cd "$LUMA_REPAIR_TARGET" && node node_modules/expo/bin/cli start --go --clear --port 8098'
