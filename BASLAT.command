#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
  echo "Node.js LTS / npx bulunamadı. Önce Node.js kurulumu gerekli."; exit 1
fi
# An additional code-only checkpoint. This is NOT a backup of phone data.
if [ ! -e "$ROOT/.luma/before-057-code-backup.txt" ]; then
  ORIGINAL="$HOME/Desktop/LumaNote_Yasayan_Bahce"
  if [ -d "$ORIGINAL" ] && [ ! -L "$ORIGINAL" ] && [ "$ORIGINAL" != "$ROOT" ]; then
    command -v zip >/dev/null && command -v unzip >/dev/null || { echo "ZIP araçları bulunamadı; yedek alınamadı."; exit 1; }
    DEST="$HOME/Desktop/LumaNote_Yedekleri"
    mkdir -p "$DEST"
    BACKUP="$DEST/LumaNote_v057_oncesi_$(date +%Y%m%d_%H%M%S)_$$.zip"
    echo "Önce eski proje kodunun yedeği alınıyor…"
    (cd "$(dirname "$ORIGINAL")" && zip -qry "$BACKUP" "$(basename "$ORIGINAL")" -x '*/node_modules/*' '*/.expo/*' '*/.git/*' '*/.luma/diagnostic-export/*' '*/.DS_Store')
    unzip -tq "$BACKUP"
    mkdir -p "$ROOT/.luma"
    printf '%s\n' "$BACKUP" > "$ROOT/.luma/before-057-code-backup.txt"
    echo "KOD YEDEĞİ HAZIR: $BACKUP"
    echo "Bu ZIP özel yapılandırmalar içerebilir; kendinde sakla. Telefon veri yedeği değildir."
  else
    echo "Eski proje Masaüstü'nde bulunamadı; onun yedeği alınmadı."
    echo "Bu yeni proje kendi klasöründe kurulacak; başka bir klasör değiştirilmeyecek."
  fi
fi
printf '\nLumaNote 0.5.7 · Evim ve Kış Bahçem\nMevcut projeyi yerinde güncellemek için MEVCUT_PROJEYI_DUZELT.command kullan.\n\n'
exec npx --yes --package=node@24 --call 'node tools/setup.cjs'
