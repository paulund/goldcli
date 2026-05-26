#!/usr/bin/env bash
# Run this once after creating the repo to enable branch protection on main.
# Requires `gh` CLI and appropriate repo admin permissions.

set -euo pipefail

REPO="${1:-paulund/goldcli}"

gh api "repos/$REPO/branches/main/protection" \
  --method PUT \
  --field required_status_checks="{\"checks\":[{\"context\":\"quality-gate\"}],\"strict\":true}" \
  --field enforce_admins=true \
  --field required_pull_request_reviews="{\"required_approving_review_count\":1}" \
  --field required_linear_history=true

echo "Branch protection enabled for $REPO main"
