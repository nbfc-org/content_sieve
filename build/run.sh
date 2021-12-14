#!/usr/bin/env bash

set -euxo pipefail

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "running ${NODE_ENV} ..."

set +x
source <(pass sc/nbfc/${NODE_ENV}.env)
export KEYCLOAK_DB_PASSWORD
export DB_PASSWORD
set -x

docker-compose \
    -p content_sieve \
    -f ./build/docker-compose.yml \
    -f "./build/${NODE_ENV}/override.yml" $@
