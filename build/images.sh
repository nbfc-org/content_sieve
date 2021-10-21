#!/usr/bin/env bash

set -euxo pipefail

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "building ${NODE_ENV} ..."

docker-compose \
    -f "${SCRIPT_DIR}/docker-compose.yml" \
    -f "${SCRIPT_DIR}/local/override.yml" build
