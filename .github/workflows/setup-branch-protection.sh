#!/usr/bin/env bash
# Run this once after creating the repo to enable branch protection on main.
# Requires `gh` CLI and appropriate repo admin permissions.

set -euo pipefail

REPO="${1:-paulund/bullion-cli}"

gh api "repos/$REPO/branches/main/protection" --method PUT --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [{"context": "quality-gate"}]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null
}
JSON

echo "Branch protection enabled for $REPO main"
