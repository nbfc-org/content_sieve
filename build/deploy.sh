#!/usr/bin/env bash

set -euxo pipefail

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

"${SCRIPT_DIR}/images.sh"
docker save "content_sieve_api:${NODE_ENV}" | ssh -C "nbfc_${NODE_ENV}" docker load
docker save "content_sieve_web:${NODE_ENV}" | ssh -C "nbfc_${NODE_ENV}" docker load
docker save "content_sieve_presite:${NODE_ENV}" | ssh -C "nbfc_${NODE_ENV}" docker load
"${SCRIPT_DIR}/run.sh" -c "nbfc_${NODE_ENV}" up -d --remove-orphans web api
