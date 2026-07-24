# ADR-001: Automated npm releases from protected main

## Status

Accepted

## Date

2026-07-24

## Context

The CLI is published as a public npm package. Manual versioning, tagging, GitHub Releases, and npm publishing can leave those records out of sync and delay fixes after they have passed review.

## Decision

Use semantic-release from a GitHub Actions workflow triggered by pushes to protected `main`. The workflow reruns the quality gate, verifies the npm tarball, then publishes to npm and creates the matching tag and GitHub Release. Conventional Commit pull request titles determine whether a merge produces a release and its semantic version. npm trusted publishing authenticates the workflow with OpenID Connect rather than a stored npm token.

The `NPM_TRUSTED_PUBLISHING_ENABLED` repository variable keeps automatic publishing off until the initial manual package publication has completed and npm trusted publishing is configured for `release.yml`.

## Alternatives Considered

- Manual tags and `npm publish`: rejected because version, tag, release, and registry publication can drift.
- Release Please: rejected because it adds a release pull request that still needs a maintainer merge.
- An npm token in GitHub Secrets: rejected because it is a long-lived credential that needs rotation and has a larger exposure window than OIDC.

## Consequences

Feature, fix, performance, and breaking-change merges release automatically after the same checks that protect `main`. Documentation, CI, and chore merges do not release. Published versions are recorded by immutable tags and GitHub Releases; `package.json` on `main` remains at the bootstrap version until a deliberate source-version update. The first registry publication remains a manual bootstrap, after which the trusted-publishing variable is enabled.
