#!/usr/bin/env bash
# Sync tiles/ to S3. Tiles are immutable: a refreshed dataset gets a new prefix (e.g. vivid-2024),
# never an in-place overwrite, so they can be cached for a year.
#
# Requires an authenticated AWS CLI session with write access to models-resources (run `aws login`).
# Usage: ./upload.sh [PREFIX]   (default geocode-imagery/vivid-2020)
set -euo pipefail
cd "$(dirname "$0")"

BUCKET="models-resources"
PREFIX="${1:-geocode-imagery/vivid-2020}"

aws s3 sync tiles/ "s3://$BUCKET/$PREFIX/" \
  --size-only \
  --exclude "*.aux.xml" \
  --content-type image/webp \
  --cache-control "public, max-age=31536000, immutable"

echo "Served at https://$BUCKET.concord.org/$PREFIX/{z}/{x}/{y}.webp"
