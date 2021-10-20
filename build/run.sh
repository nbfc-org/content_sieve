#!/usr/bin/env bash

set -euxo pipefail

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "running ${NODE_ENV} ..."

docker-compose \
    -p content_sieve \
    -f ./build/docker-compose.yml \
    -f "./build/${NODE_ENV}/override.yml" $@
