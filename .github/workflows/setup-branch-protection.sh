#!/usr/bin/env bash
# Run this once after creating the repo to enable branch protection on main.
# Requires `gh` CLI and appropriate repo admin permissions.
#
# Standard protection for an open source public repo:
#   - 1 required approving review
#   - admins must follow same rules (no bypass)
#   - stale reviews dismissed on new pushes
#   - quality-gate status check required

set -euo pipefail

REPO="${1:-paulund/bullion-cli}"

gh api "repos/$REPO/branches/main/protection" --method PUT --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [{"context": "quality-gate"}]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
JSON

echo "Branch protection enabled for $REPO main"
