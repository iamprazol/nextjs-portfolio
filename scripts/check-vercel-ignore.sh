#!/usr/bin/env bash
# Proves vercel.json's ignoreCommand builds only the branches we deploy.
# Vercel semantics: exit 1 = build, exit 0 = skip.
set -u

cd "$(dirname "$0")/.."
cmd=$(node -p "require('./vercel.json').ignoreCommand")
fail=0

check() {
    local branch=$1 expected=$2 actual
    VERCEL_GIT_COMMIT_REF="$branch" bash -c "$cmd"
    actual=$?
    if [ "$actual" -eq "$expected" ]; then
        echo "ok    $branch -> exit $actual"
    else
        echo "FAIL  $branch -> exit $actual (expected $expected)"
        fail=1
    fi
}

# Built: production (master) and previews (design-update, develop).
check master 1
check design-update 1
check develop 1

# Skipped: everything else, including near-misses.
check main 0
check feature/foo 0
check master-backup 0
check design-update-2 0
check "" 0

exit $fail
