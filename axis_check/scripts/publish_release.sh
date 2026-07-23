#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AXIS_CHECK_DIR="$ROOT_DIR/axis_check"
UPLOADS_DIR="$ROOT_DIR/uploads/axis-check"
RELEASES_DIR="$AXIS_CHECK_DIR/releases"
APK_SOURCE="${1:-$AXIS_CHECK_DIR/build/app/outputs/apk/release/app-release.apk}"
PUBSPEC_FILE="$AXIS_CHECK_DIR/pubspec.yaml"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://axis.ambipar.vps-kinghost.net}"
NOTES="${NOTES:-Atualizacao publicada automaticamente pelo fluxo interno do Axis Check.}"

if [[ ! -f "$APK_SOURCE" ]]; then
  echo "APK nao encontrado em: $APK_SOURCE" >&2
  exit 1
fi

version_line="$(grep '^version:' "$PUBSPEC_FILE" | head -n 1 | awk '{print $2}')"

if [[ -z "$version_line" ]]; then
  echo "Nao foi possivel identificar a versao em $PUBSPEC_FILE" >&2
  exit 1
fi

version_name="${version_line%%+*}"
build_number="${version_line##*+}"
version_label="${version_name}+${build_number}"

mkdir -p "$UPLOADS_DIR" "$RELEASES_DIR"

stable_apk="$UPLOADS_DIR/axis-check-latest.apk"
versioned_apk="$UPLOADS_DIR/axis-check-v${version_label}-release.apk"
release_copy="$RELEASES_DIR/axis-check-v${version_label}-release.apk"
version_json="$UPLOADS_DIR/version.json"

cp "$APK_SOURCE" "$stable_apk"
cp "$APK_SOURCE" "$versioned_apk"
cp "$APK_SOURCE" "$release_copy"

published_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

cat > "$version_json" <<EOF
{
  "app": "axis_check",
  "version": "$version_name",
  "buildNumber": $build_number,
  "downloadUrl": "$PUBLIC_BASE_URL/uploads/axis-check/axis-check-latest.apk",
  "forceUpdate": true,
  "notes": "$NOTES",
  "publishedAt": "$published_at"
}
EOF

echo "APK publicado com sucesso:"
echo "  Estavel: $stable_apk"
echo "  Versionado: $versioned_apk"
echo "  Metadados: $version_json"
