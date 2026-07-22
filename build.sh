#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
node tools/build.js
node tools/tests.js
