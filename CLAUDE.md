# CLAUDE.md: Kishore Theiveekan portfolio

## Before anything else

If `.handover/` exists in this folder, read `.handover/README.md` and `.handover/PROJECT-STATUS.md` first. It holds the status, decisions, change history, session log and prompt log, and it is the source of truth, not chat history or Claude memory. The wider project (GitHub, LinkedIn, resumes, job search) is tracked in `~/Documents/website design plan/.handover/`.

## Keeping the tracker updated (mandatory)

After every piece of work or decision, update `.handover/` in the same turn: PROJECT-STATUS (last updated, current state, in progress, next steps), SESSION-LOG, DECISIONS, CHANGELOG (with the commit hash). PROMPT-LOG is appended by `.claude/hooks/log-prompt.mjs`. Update §6 "In progress" before long steps, so a session cut off mid-task can be resumed from another account.

`.handover/` and `.claude/` are git-ignored because this repository is public. Never commit them, and never commit private data (phone number, career plans, client names, VAPT details).

## Project rules

- Next.js 16 static export (`output: "export"`), React 19, Three.js 0.160. No server.
- `src/components/Markup.jsx` (markup) and `src/components/Experience.jsx` (scroll, 3D and interaction logic) came from the Claude Design file by a one-off converter and are now edited directly. Do not regenerate them.
- Content lives in `src/content/portfolio.js` and `src/content/site.ts`. Every claim must be true and checked; client names stay hidden.
- Before reporting work as done: `npm run build`, then `npm test` (with `QA_BANNED` set as in `.handover/PROJECT-STATUS.md`), and check desktop and phone in a real browser.
- Publishing is done by the owner: `git push` and `npx vercel deploy --prod --yes`.
</content>
