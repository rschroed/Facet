# GitHub Workflow

Facets uses GitHub Issues as the source of truth. Local TODO documents should not replace issues.

## Issue Types

- `type:epic` - parent issue coordinating a body of work.
- `type:task` - scoped implementation or documentation task.

The restart epic is [#1](https://github.com/rschroed/Facet/issues/1): `Facets restart: canvas-first editable nodes`.

## Labels

Required labels:

- `type:epic`
- `type:task`
- `area:docs`
- `area:app`
- `area:canvas`
- `area:model`
- `status:ready`
- `status:in-progress`
- `status:blocked`

Use one `type:*` label, one or more `area:*` labels, and one `status:*` label.

## Branches

Use issue-numbered branches:

```text
issue-<number>-short-slug
```

Example:

```text
issue-2-github-workflow
```

Archive branches use:

```text
archive/<short-description>
```

The pre-restart scaffold is archived at `archive/pre-restart-scaffold`.

## Pull Requests

- Open a draft PR early for each issue branch.
- Keep each PR scoped to one issue.
- Link the issue in the PR body.
- Use `Closes #<number>` only when the PR is ready to merge.
- Include acceptance criteria copied or summarized from the issue.
- Include validation notes, even for docs-only PRs.

## Restart Issue Sequence

1. [#2](https://github.com/rschroed/Facet/issues/2) - Document GitHub workflow.
2. [#5](https://github.com/rschroed/Facet/issues/5) - Reset app scaffold around Tauri + React Flow.
3. [#4](https://github.com/rschroed/Facet/issues/4) - Define Facets artifact model.
4. [#3](https://github.com/rschroed/Facet/issues/3) - Define local project file shape.
5. [#8](https://github.com/rschroed/Facet/issues/8) - Build static canvas with Brief, Direction, and Prompt nodes.
6. [#7](https://github.com/rschroed/Facet/issues/7) - Add collapsed and expanded node editing states.
7. [#6](https://github.com/rschroed/Facet/issues/6) - Add local project persistence.
8. [#9](https://github.com/rschroed/Facet/issues/9) - Add prompt copy/export workflow.

Issue numbers differ from the planned sequence because some issues were created in parallel. The sequence above is authoritative.

## Acceptance Rules

An issue is done when:

- Its acceptance criteria are satisfied.
- The PR links the issue.
- Validation is documented in the PR.
- The work does not introduce out-of-scope v1 behavior unless a later issue explicitly changes scope.
