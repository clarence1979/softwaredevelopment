# VCE Software Development — Digital Vector courseware hub

A single-page hub (`index.html`) wired to 52 interactive key-knowledge modules across the
four VCAA Applied Computing (Software Development) Units 3 & 4 outcomes, plus downloadable
PDF study summaries.

## Contents
- `index.html` — the VS Code-styled hub (chapter tabs, key-knowledge subrail, embedded modules).
- `chapter-1-programming/` … `chapter-4-cyber-security/` — the interactive HTML modules.
- `analysis.html`, `design.html`, `development.html`, `evaluation.html` — legacy standalone modules.
- `pdf/` — 56 study summaries: one per key knowledge (`pdf/<chapter>/kkNN-summary.pdf`) and one
  per chapter (`pdf/<chapter>-summary.pdf`). Each includes sample questions and model answers.
- `.nojekyll` — tells GitHub Pages to serve every file as-is (no Jekyll processing).

## Publishing to GitHub Pages
1. Create a repository and upload this folder's contents to the repo root.
2. In **Settings → Pages**, set **Source = Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Your site will be live at `https://<user>.github.io/<repo>/`.

All links are relative and lower-case, so the site works both on GitHub Pages and when opened
locally. Modules cross-link related key-knowledge terms (dotted underline); each opens in a new tab.

## Notes
- PDF summaries are plain-English study aids — always check wording against the official VCAA
  study design and exam specifications.
- Built by Digital Vector.
