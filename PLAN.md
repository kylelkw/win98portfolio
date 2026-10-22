# Portfolio content update

## Approved presentation

Keep the Windows-style layout. Show a one-sentence summary for every project on desktop and mobile, with one "Code available upon contact" notice above the project list. Its Email Me link opens the site's composer with a code-request subject and message. Remove GitHub navigation and repository links and use the supplied resume URL.

Add MelonSight, Glyph, ARMadillo, and Koharu from the resume; update the existing Spatial Ink entry rather than duplicating it.

Preserve the user's concurrent edits to the About text and removal of the remaining demo/site URLs.

## Implementation

- [x] Update the resume URL and project descriptions/data.
- [x] Remove GitHub from desktop icons, windows, Start menu, and mobile navigation; shift remaining icons up.
- [x] Show project summaries and one code-request email notice above the list on desktop and mobile; keep projects accessible from the Start menu.
- [x] Prevent the initial About window from appearing at its template position before centering.
- [x] Verify the production build and desktop/mobile presentation.

## Clippy helper (approved follow-up)

Use one static classic Clippy sprite with an opening introduction and automatic contextual messages for navigation, resume, projects, artwork, email, and project details. Use the site's pixelated MS Sans Serif font in a plain speech bubble, with a small close control and click-to-reopen behavior. Keep dismissed tips closed as the visitor navigates and keep the helper above desktop and mobile navigation. No sprite animation or navigation buttons are needed.

- [x] Add the local sprite and source attribution.
- [x] Implement contextual tips and dismiss/reopen controls, using the site's font and no navigation buttons.
- [x] Show the dismissed "Need a hand?" prompt in a speech bubble above the sprite, without button borders around Clippy.
- [x] Verify desktop/mobile behavior, contextual messages, sprite rendering, and dismissal.

## Readability follow-up

- [x] Increase text sizes sitewide by 2px and verify menus, windows, and mobile navigation still fit.
- [x] Increase the default Email window to 520 x 500 so the compose form and Send Email button are visible.

## Internet Explorer follow-up

- [x] Keep LinkedIn external, as requested; give Internet Explorer a local start page.
- [x] Handle unsupported upstream response codes (LinkedIn returns 999) as a readable 502 fallback and time out stalled requests.
- [x] Verify browser navigation and the upstream-error regression.

## Verification

- Production build passed in a temporary source copy, without disrupting the user's development server; source files matched the final checkout.
- TypeScript and ESLint checks passed; all three embed endpoint regression tests passed.
- Verified centered About position and contiguous icons; the initial HTML hides About until centered.
- Verified desktop and mobile project summaries, single notice, and code-request composer; the 520 x 500 desktop Email window shows Send Email without scrolling.
- Verified Clippy's static sprite, matching font, contextual messages, dismissal, and speech-bubble reopening prompt; no sprite button border or navigation overlap.
- Verified Internet Explorer's local start page, embedded page navigation/history, and updated resume preview. LinkedIn remains external.

## Skills config correction

- [x] Replace the saved Skills block with the user's updated languages, libraries, tools, and creative software list.
- [x] Verify the shared About component renders the updated list used by desktop and mobile; rendering check confirmed all four groups and new skills, and diff validation passed.

## Mini games (approved)

Add locally built Minesweeper and Tetris with separate desktop icons, independent windows, Start menu entries, and mobile shortcuts. Reuse the existing window system and styling without external game services or new dependencies.

Place the two game icons below Internet Explorer in the main icon column. Preserve the existing taskbar-safe wrapping on short desktop viewports.

Minesweeper: 9 x 9 board, 10 mines, safe first reveal, flood reveal, flags via right-click or touch flag mode, elapsed time, win/loss, and restart.

Tetris: 10 x 20 board, seven piece shapes, movement, rotation, soft/hard drop, line clearing, score, increasing speed, pause/resume, and restart. Include keyboard and on-screen touch controls. Pause when inactive, minimized, or the browser loses focus. Preserve games while minimized or switching mobile sections; closing a desktop game starts fresh on reopening.

Keep each game's rules in a small pure TypeScript module, with its React component handling presentation and input. Test first-click safety, flags, win/loss, piece collision/rotation, line clearing, scoring, and game over. Verify desktop and narrow mobile layouts, keyboard/touch interactions, independent icons, and paused background games.

- [x] Implement both game engines and focused tests.
- [x] Add game UI, separate icons/windows, mobile controls/shortcuts, and Clippy tips.
- [x] Verify tests, types/lint, production build, and desktop/mobile behavior.

Game verification: all 10 tests passed, TypeScript/ESLint and the isolated production build passed, and the build source matched the checkout. Browser checks covered separate icons below Internet Explorer, default desktop window fit, safe reveal and touch flagging, Tetris keyboard and touch controls, pausing on minimize/section changes, restored progress, and 375px/320px mobile layouts with reachable controls and no horizontal overflow. Clippy stays out of the way on mobile game screens.

## Game icon spacing correction

- [x] Enlarge Tetris artwork to fill its 32px icon canvas and remove the forced Minesweeper label split.
- [x] Match desktop tiles to a consistent 72px grid so all nine icons fit in the main column at 720px height; wrap overflow at the top of the next column on shorter screens.
- [x] Verify icon layout, drag normalization, shared 16px icons, types, and lint.

Icon correction verification: all 13 tests passed, TypeScript/ESLint and diff checks passed. Browser checks confirmed nine evenly spaced icons below Internet Explorer at 720px height, clean top-of-column wrapping at 600px, full-size 31px Tetris artwork, and correct 16px title/mobile icons without horizontal overflow.

## Shorter navigation names

- [x] Rename Current Projects to Projects and Internet Explorer to Internet in the shared labels used by icons, windows, menus, and mobile navigation.
- [x] Make the browser start-page heading use the shared browser label.

## Mobile resume fix and publishing

- [x] Show the resume directly in the mobile Resume section using the existing PDF preview URL helper and a phone-sized iframe.
- [x] Keep a direct resume link as a fallback without relying on a JavaScript popup.
- [x] Run required checks: all 13 tests, TypeScript, ESLint, diff checks, and an isolated production build passed.
- [ ] Visually verify the mobile document (browser security policy blocked the local preview check).
- [ ] Commit and push the fix to GitHub, then check the deployment outcome.

Current step: publish the verified mobile resume code and check deployment. The mobile section now uses the same Google Drive PDF preview helper as desktop, with a full-width phone-sized frame and a direct-link fallback. Visual verification remains unavailable because of browser policy. Earlier portfolio updates are already committed in the current main checkout.
