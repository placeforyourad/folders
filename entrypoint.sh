#!/bin/sh
set -e

npx prisma migrate deploy

node scripts/init-root.js

exec "$@"