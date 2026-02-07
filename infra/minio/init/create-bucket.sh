#!/bin/sh
set -e
mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc mb -p local/conference-uploads || true
mc anonymous set none local/conference-uploads
