#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
# This command does not touch user notes or install packages.
npx --yes --package=node@24 --call 'node -e "require(\"./tools/download-recordings.cjs\").main().then(r=>{if(r.missing.length)console.warn(\"Bazı kayıtlar hâlâ eksik.\")}).catch(e=>{console.error(e);process.exitCode=1})" && node tools/build-ui.cjs && node tools/verify.cjs'
echo "Ses durumu güncellendi. Expo sunucusunu Control+C ile durdur; aynı proje klasöründe BASLAT.command ile aç."
