# Perplexity Reader Companion

## Prototype 0.1.0 - structural inspector

This is an unpacked Chrome extension, separate from DoDA-docs.

Click the extension while viewing a Perplexity HTTPS page. It inspects the
current page DOM and displays a structural report. Use Copy report to
explicitly place that report on the clipboard.

The report includes page origin/path, code-block sizes, selected attributes,
CSS classes and ancestor structures. It excludes conversation text and code
bodies, but metadata may still identify the thread. Review before sharing.

No external network requests, analytics, remote scripts, automatic downloads,
conversation submission or code execution are implemented.

Superseded in part: the Stage 2 ISE runner (TB-036, TB-037, TB-039, TB-041, TB-043) adds code execution through a native host after user confirmation unless the confirm toggle is off. The sentence above describes the earlier diagnostic prototype.

## Permissions

- activeTab: temporary page access after user activation.
- scripting: inject the local inspection script.
- clipboardWrite: copy the report after the user clicks Copy report.

## Installation

Open chrome://extensions, enable Developer mode, choose Load unpacked,
and select this directory. Pin the extension if convenient.

## Status

Installer verification establishes file creation and JavaScript syntax only.
Chrome loading, page inspection and clipboard behavior require manual testing.

Themes, assistant-message recognition, bottom code-copy buttons, copy-latest
shortcut, auto-copy, capture and artifact downloads are not implemented yet.

<!-- automatic-inspector-0.1.1 -->

## Prototype 0.1.1 - automatic activation

This section supersedes the earlier click-only activation instructions.

The inspector now loads automatically on HTTPS pages at perplexity.ai and
www.perplexity.ai, after the page DOM is ready. It runs in the top frame only.
The extension action remains available as an additional manual trigger.

Reload the extension in chrome://extensions, then reload the Perplexity page.
Chrome may require approval of the newly declared website access.

The overlay opens automatically for this diagnostic prototype. Copy report
is still a deliberate user action. No automatic clipboard writes, downloads,
network transmission or code execution have been added.

Superseded in part: code execution has since been added by the Stage 2 ISE runner (see TB-036 and TB-037). The sentence above describes the earlier clipboard-copy change.

Compatibility with the user's Borderless Window setup is PENDING testing.
This change creates no executable launchers and does not modify Chrome
profiles or bypass browser permissions.

Intended packaging: two separate Windows launcher executables, one for the
local Document Reader and one for live Perplexity with this helper installed.
Executable creation, launcher paths and startup behavior remain pending.

Do not treat successful JSON validation or file verification as Chrome
loading, live-page, clipboard or borderless-window acceptance.

## Rescan diagnostic update

A user-supplied live report captured at 2026-11-24T06:49:36.181Z confirmed
execution on the Perplexity session page but found zero pre elements.
This is not evidence that the conversation contains no code.
Rendering timing and alternate code markup remain possible explanations.

The inspector now supports Rescan now. Close collapses it to an
Inspect / Rescan button so the page can finish loading and the user can
scroll a code block into view before taking a fresh snapshot.

Additional structural samples cover code elements, candidate code-block
containers, and ancestors of Copy controls. No code bodies or conversation
text are included in the report. Metadata can still identify the thread.

Diagnostic patch browser behavior and assistant-code identification remain
unverified. Executable launchers and functional code-copy controls remain
unimplemented. Backups must remain outside the extension directory.
## Bottom-copy prototype 1

Evidence: the user-supplied rescan at 2026-11-24T06:57:59.217Z found one
visible pre block, with a figure containing a figcaption and one nested
code element. Its code text had 9,941 characters and 253 lines.
The earlier zero-pre snapshot does not establish absence of code.
The precise cause of that earlier result was not isolated.

The appended prototype adds Copy this block below matching loaded blocks.
It copies code.textContent without trimming or adding a newline.
Clipboard access is invoked only by an explicit button click.
A manual-selection fallback is offered when clipboard writing fails.

The page observer discovers newly inserted matching blocks. It does not
establish that all historical messages are present or that a response has
finished streaming. Per-block controls are not restricted to a verified
assistant-message container. No Copy latest assistant code claim is made.

No automatic copying, execution, pasting into another program, message
submission, download, network request or launcher creation was added.

Pending browser checks: bottom button placement, dynamic block discovery,
clipboard success, exact text comparison with native Copy, and behavior
when messages stream or are removed. Syntax and byte verification are not
browser acceptance. Future backups must remain outside the extension root.


## Bottom-copy verification record - 2026-11-24

RecordedAt: 2026-11-24T02:07:49.5816703-05:00

Editable project record: README.md. Structured record: verification.csv.
Both are maintained records, not generated application output.

This dated entry updates the earlier pending browser-test status; earlier history is retained.
Evidence source: user report and pasted test output in the development conversation on 2026-11-24.
RecordedAt is the persistence time, not the browser-test capture time.

| TestId | Feature | Result | Evidence | Limitations |
| --- | --- | --- | --- | --- |
| BC-001 | Bottom Copy button | USER_REPORTED_BASIC_PASS | User reported SUCCESS and Copied 11,282 characters / 298 lines; pasted code had expected beginning and ending without visible surrounding controls. | Single-block smoke test. Counts are button-reported, not independently measured. Not exact-copy or full feature acceptance. |
| BC-002 | Exact copied-text fidelity | NOT_TESTED | No exact comparison with native Copy or a reference text was supplied. | Whitespace, line endings, trailing newline and character-for-character equivalence remain unverified. |
| BC-003 | Dynamic block discovery and removal | NOT_TESTED | No dedicated insertion or removal test was reported. | Observer implementation does not constitute runtime validation. |
| BC-004 | Streaming and changing code | NOT_TESTED | No copy-during-streaming test was reported. | Response completion and stability detection are not established. |
| BC-005 | Copy latest assistant code | NOT_IMPLEMENTED | Prototype supplies explicit per-block controls only. | Assistant ownership and full-thread latest-block selection are not verified. |
| BC-006 | Companion and Document Reader executables | NOT_IMPLEMENTED | No executable build or acceptance result exists in the supplied workflow. | Extension prototype is not either requested executable. |

Overall status: basic per-block copy smoke test passed by user report; full acceptance remains pending.
No automatic copying, execution, cross-application pasting or message submission is authorized by this record.
Scope: this standalone Companion folder; no DoDA documentation or batch exports are modified.

<!-- fixed-toolbar-prototype-1 -->

## Fixed toolbar prototype 1 - current status

RecordedAt: 2026-11-24T02:13:44.6791399-05:00

This section supersedes earlier automatic-overlay and missing-toolbar status.
Editable source: inspect.js. Maintained records: README.md and verification.csv.
No generated HTML or executable is produced by this update.

BC-007 | Manual copy paste execution workflow | USER_REPORTED_WORKFLOW_PASS
User confirmed the bottom Copy button was used to copy the persistence
script, then manually paste and execute it. The returned report verified
the README and six-row CSV writes. This expands the earlier basic copy
smoke test; it does not establish exact character-for-character fidelity.
Copy, paste and execution remain separate actions under user control.

TB-001 | Fixed toolbar and on-demand inspector | IMPLEMENTED_PENDING_BROWSER_TEST
The toolbar provides Jump to last loaded block, Copy last loaded block,
Clear feedback and Inspector. The inspector starts collapsed without
taking focus; the extension action can still open it. Bottom Copy buttons
remain. Clear feedback hides local fallback text and clears copy messages,
not the clipboard.

Last loaded means the last rendered matching pre/figure/code block in DOM
order at click time. It is not a guarantee of assistant ownership, latest
thread content, response completion, visibility within the viewport, or
stability while streaming. Historical blocks may be absent from the DOM.
Clipboard copying occurs only after a copy-button click. Copy failure
offers selected text for manual Ctrl+C. Jump and Clear do not copy.

Browser acceptance is pending for toolbar placement, jump targeting,
clipboard copying, Clear behavior, on-demand inspection and regression
of bottom controls. Exact-copy fidelity, streaming and dynamic discovery
retain their earlier untested status. Latest-assistant selection and both
requested executable launchers remain unimplemented.

The existing CSV schema and prior six rows are preserved. BC-007 and TB-001
are appended as distinct records; no earlier coverage credit is promoted.
Standalone Companion scope only: no DoDA manuscript, Unity documentation,
batch export, permissions, manifest or background script changes.

<!-- toolbar-browser-smoke-results-20261124 -->

## Toolbar browser smoke results - 2026-11-24

RecordedAt: 2026-11-24T02:21:02.5431608-05:00

Evidence source: explicit user confirmation of toolbar copying at 02:14
and all five remaining checks at 02:19, user-local time, in the development
conversation on 2026-11-24. RecordedAt is persistence time, not test time.

| TestId | Feature | Result | Evidence | Limitations |
| --- | --- | --- | --- | --- |
| TB-002 | Toolbar copy last loaded block | USER_REPORTED_BASIC_PASS | User confirmed the previously pasted installer text was copied using the toolbar Copy last loaded block button. | One reported copy and paste-back; not exact-text equality or latest-assistant verification. |
| TB-003 | Toolbar jump targeting | USER_REPORTED_BASIC_PASS | User reported pass: Jump takes them to the block that Copy selects. | Current loaded content only; not full-thread latest-block verification. |
| TB-004 | Clear feedback preserves clipboard | USER_REPORTED_BASIC_PASS | User reported pass: status clears while clipboard contents remain unchanged. | Manual smoke test only; no instrumented clipboard comparison. |
| TB-005 | Inspector open close and toolbar usability | USER_REPORTED_BASIC_PASS | User reported pass: Inspector opens and closes without disabling the toolbar. | Does not separately establish automatic-startup behavior or keyboard accessibility. |
| TB-006 | Toolbar placement usability | USER_REPORTED_BASIC_PASS | User reported pass for layout: no overlap preventing access to controls they need. | Current user layout only; not all viewport sizes, zoom levels or pages. |
| TB-007 | Bottom Copy regression after toolbar patch | USER_REPORTED_BASIC_PASS | User reported pass: the original bottom Copy button still works. | No new independent fidelity, streaming or dynamic-discovery test. |

These results supplement TB-001's historical implementation-pending entry.
The six named checks now have user-reported basic passes; TB-001 is retained
unchanged as implementation history, not treated as the latest test result.
This is bounded smoke-test credit, not independent or full feature acceptance.

Exact copied-text equality, streaming behavior, dynamic discovery/removal,
assistant ownership, full-thread latest-code selection and automatic-startup
behavior have not been separately established by these reports.
Latest-assistant selection and both executable launchers remain unimplemented.
Earlier unrelated test statuses and coverage credit are preserved.

This records-only update changes README.md and verification.csv.
It does not change inspect.js, background.js, manifest.json or permissions.
The Companion copies only on request; paste and execution remain manual.
Standalone Companion scope: no DoDA manuscript, Unity documentation or batch
exports are applicable to this update.

<!-- bottom-native-fidelity-BC-008 -->

## Bottom/native clipboard comparison - BC-008

RecordedAt: 2026-11-24T02:26:03.3008525-05:00
Result: USER_MEDIATED_NATIVE_COMPARISON_EXACT_PASS

Evidence: Fixture PReader-Fidelity-Fixture-20261124-A; bottom captured 2026-11-24T02:25:59.3946987-05:00; native captured 2026-11-24T02:26:03.2948357-05:00; bottom UTF16 units 193, native 193; ordinal equal True; newline-normalized equal True; first differing zero-based UTF16 index -1 (-1 means exact); UTF8 SHA256 bottom A9E45ECE52C15FAD7D0B6C0DDE3007692E9C76BB5473FEF46EE13844C408F6C7; native A9E45ECE52C15FAD7D0B6C0DDE3007692E9C76BB5473FEF46EE13844C408F6C7.

Limitations: User selected both copy controls on the same fixture. Equality applies to clipboard strings returned by Get-Clipboard -Raw. Hashes encode those strings as UTF8, not raw Windows clipboard storage. One ASCII fixture only; no independent authored-source comparison, toolbar-path fidelity, Unicode fixture, streaming or general acceptance.

The fixture text was never executed by the verification script.
Raw ordinal comparison occurs before newline normalization; normalization
does not trim text or remove a trailing newline. NEWLINE_ONLY is not an
exact pass. MISMATCH is retained as a result rather than promoted to pass.

This is a bounded follow-up to BC-002's historical NOT_TESTED entry.
BC-002 and all previous records remain unchanged. BC-008 supplies only
the new fixture-specific comparison outcome; it does not establish full
fidelity acceptance or response completion detection.

Extension code, manifest and permissions are unchanged.
Standalone Companion records only; DoDA manuscript and batch exports
are not applicable.

<!-- companion-launcher-build-1 -->

## Companion launcher build 1

RecordedAt: 2026-11-24T02:30:52.1279327-05:00

Editable launcher source: PerplexityCompanionLauncher.cs
Generated launcher output: PerplexityCompanion.exe
Existing extension source: inspect.js, background.js and manifest.json.
Maintained records: README.md and verification.csv.

ENV-001 | LOCAL_PREFLIGHT_VERIFIED
User-provided Chrome version-page information identified the configured
executable and Default profile. The local build checks confirmed:
Chrome: C:\Program Files\Google\Chrome\Application\chrome.exe
Detected product version: 158.0.8127.38
Profile: C:\Users\nicka\AppData\Local\Google\Chrome\User Data\Default
Compiler: C:\WINDOWS\Microsoft.NET\Framework64\v4.0.30319\csc.exe
Compiler SHA256: 46809206887326D2D24DB1EFF1F3064DE972C3451ABE766B49111450A5E08E00

LA-001 | BUILD_VERIFIED_RUNTIME_NOT_TESTED
Source SHA256: B7E5410D6AD2EF1FAFEA539011520531D40CF0221B18E49C74B55CC4C2B3B271
Executable SHA256: 9B06AB39B7545A07E744C6B4E4B7C0B77AC31A7A89EB4342B77C81EBBDAF1AA0
Compilation, Windows GUI PE subsystem and assembly version were verified.
The executable was not run. Successful compilation is not startup acceptance.

On manual launch, the program requests the existing Chrome user-data root,
profile Default and app-mode address https://www.perplexity.ai/.
It requires the configured Windows user, existing profile directory and
adjacent extension files. It does not install or enable the extension,
read browser credentials, copy clipboard data, execute scripts, paste into
PowerShell or submit messages. It does not edit Chrome profile files itself;
Chrome may perform its normal profile writes during use.

The output is an unsigned local prototype. Do not bypass system security
warnings or change browser security settings to run it. It is a launcher
for installed Chrome plus the existing unpacked extension, not a standalone
browser engine. Keep the executable beside the extension files.

Application mode is requested, not guaranteed fully borderless. Existing
borderless utilities and settings are untouched. No forced fullscreen,
window-style manipulation, debugging port, extension-loading override,
administrator elevation, installer, shortcut or auto-start entry is added.

Pending: manual startup, expected signed-in Default profile, Companion
toolbar and copy controls in the launched window, app-window appearance,
and repeated-launch behavior. Full latest-assistant detection is still
unimplemented. The separate DoDA Document Reader executable is not built
by this script. BC-006 remains historical; LA-001 records only this limited
Companion launcher build, not completion of both requested applications.

Implementation references:
https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/
https://peter.sh/experiments/chromium-command-line-switches/

This standalone update preserves earlier records. No DoDA manuscript,
Unity documentation or batch exports are applicable.

<!-- companion-runtime-smoke-LA-002 -->

## Companion launcher runtime checkpoint - LA-002

RecordedAt: 2026-11-24T02:33:47.5173161-05:00
Result: USER_REPORTED_RUNTIME_SMOKE_PASS

Evidence: After manual-launch instructions, user reported SUCCESS at 2026-11-24 02:31 local time. Asked to confirm the expected signed-in account and working Companion toolbar/Jump/Copy, user replied at 02:32: Yes, I am using it right now.

Limitations: User-reported current-session smoke pass, not independent observation. Exact title-bar/border appearance was not separately described. Cold start, repeated launch, restart recovery and all-window behavior remain untested. Does not establish latest-assistant selection, full fidelity acceptance or completion of the separate DoDA Reader.

This supplements LA-001's build-time runtime-not-tested status. That
historical build entry is preserved. The launcher is built and has a
user-reported successful current-session launch with the expected working
account and Companion controls. This is not full application acceptance.

Launcher source: PerplexityCompanionLauncher.cs
Generated launcher: PerplexityCompanion.exe
Both are unchanged by this records-only update, as are the extension
JavaScript, manifest and permissions. No application is launched or closed.
Manual copy, paste and execution remain separate user-controlled actions.

The exact borderless/title-bar outcome remains unspecified. Latest-assistant
selection and the separate DoDA Document Reader executable remain
unimplemented. Earlier test limits and coverage credit are preserved.

Standalone Companion records only. No DoDA manuscript, Unity documentation
or batch exports are applicable to this update.

<!-- companion-launcher-build-2 -->

## Companion launcher build 2 - Edge and URL prompt

Editable launcher source: PerplexityCompanionLauncher.cs
Generated launcher output: PerplexityCompanion.exe

This build supersedes the Chrome launch target of build 1 (LA-001, LA-002 are preserved as history). The launcher now starts Microsoft Edge in app mode with the existing Default profile, and asks for a Perplexity URL first. Only https URLs on perplexity.ai or www.perplexity.ai are accepted; cancelling exits without launching. The last URL is not remembered.

Edge: C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe (158.0.4370.33)
Profile: C:\Users\nicka\AppData\Local\Microsoft\Edge\User Data\Default

Load the extension once in Edge: open edge://extensions, enable Developer mode, choose Load unpacked, and select this folder. Sign in to Perplexity inside Edge; Chrome sessions do not carry over.

LA-003 | BUILD_VERIFIED_RUNTIME_NOT_TESTED. Source SHA256 925D6F1C571ACBFF9AF0B298896D8A4865E2434B014B2E6E37CAAA72D2A297A9; executable SHA256 DD0ED1425B040630CFE7F06E0198B810B9B8680EDBFBA603608AE2FAE0947414.

Pending: manual startup, URL prompt behavior, extension activation in Edge, and whether Edge Read Aloud is available in an app-mode window.

<!-- companion-edge-runtime-LA-004 -->

## Companion Edge runtime checkpoint - LA-004 and LA-005

RecordedAt 2026-11-25T19:12:43.6204735-05:00

Result: USER_REPORTED_RUNTIME_SMOKE_PASS (LA-004). The user reported that the extension is installed in Edge and all buttons are functional after launching the build 2 executable, which prompted for a URL and opened the correct page. Individual buttons, cancel and invalid-URL handling, repeated launch and Edge Read Aloud in the app-mode window were not reported and remain untested.

Correction (LA-005): the build 2 backup folder was inside the extension directory, which Edge refuses to load because names starting with an underscore are reserved. The folder now lives at E:\Dev\PerplexityReaderCompanion-backups\_backups. The earlier build 2 section is preserved and its backup path is superseded by this note.

Planned, not implemented: quick-reply toolbar buttons that insert and send text (check symbol for "yes / approved / go", skip-next symbol for "next"), with draft protection. The composer structure has not yet been inspected.

<!-- companion-quick-reply-TB-008 -->

## Toolbar quick-reply buttons - TB-008 and ENV-003

RecordedAt 2026-11-25T19:21:16.1692002-05:00

Composer probe (ENV-003): the follow-up composer is a Lexical contenteditable textbox labelled Ask a follow-up; the Submit button is labelled Submit and is disabled while the composer is empty.

TB-008 IMPLEMENTED_PENDING_BROWSER_TEST: two toolbar buttons insert and send text. The check-mark button sends "yes / approved / go" and the skip-next button sends "next". They refuse to act when a draft is present, when the composer or Submit button cannot be uniquely found, or when Submit does not enable. Each outcome is shown in the toolbar status line.

Editable source inspect.js. Manifest, permissions and background.js are unchanged. Sending is irreversible and happens only on a direct click. Not yet run in a browser: reload the extension in edge://extensions, reload the Perplexity page, and test in a throwaway thread. Behavior while a response is streaming is untested.

<!-- companion-test-results-TB-009 -->

## Companion test results - TB-009 and LA-006

RecordedAt 2026-11-25T19:26:30.7796582-05:00

TB-009 USER_REPORTED_BASIC_PASS: the user sent a message with the toolbar check button and it arrived as yes / approved / go. One use; the skip-next button, draft protection and streaming behavior remain untested.

LA-006 USER_REPORTED_BASIC_PASS: Edge Read Aloud works in the Companion app window through the Ctrl+Shift+U hotkey. There is no Read Aloud button in the window and the extension adds none.

Both results are user-reported and supplement TB-008 and LA-003, which are preserved unchanged.

<!-- companion-hide-chrome-TB-010 -->

## Hide site UI toggle - TB-010, ENV-004, TB-011

RecordedAt 2026-11-25T19:32:06.0618660-05:00

ENV-004: the Perplexity left rail is an aside containing nav[aria-label=Sidebar navigation]; the thread header is a div with the class token h-headerHeight and contains Share.

TB-010 IMPLEMENTED_PENDING_BROWSER_TEST: the toolbar button Hide site UI / Show site UI toggles one injected style element that hides both. Default is shown; the choice is remembered in localStorage key preaderHideSiteChrome. The status line reports matched element counts. Reload the extension and the page to test. Hiding the header also hides Share and the thread title.

TB-011 REQUIREMENT_RECORDED_NOT_IMPLEMENTED: a Read Aloud toolbar button is wanted. Edge native Read Aloud stays on Ctrl+Shift+U; a page-level Web Speech reader is the proposed approach and needs further probing.

<!-- companion-read-aloud-TB-012 -->

## Toolbar Read Aloud controls - TB-012 and ENV-005

RecordedAt 2026-11-25T19:35:35.0606466-05:00

ENV-005: the DoDA readaloud.js design was read in part, and Perplexity answers were found in div.prose with code in pre.not-prose. Edge exposes 324 voices to pages, including en-US Natural online voices.

TB-012 IMPLEMENTED_PENDING_BROWSER_TEST: Read aloud, Stop, speed and Voice buttons in the toolbar. Reads the selection, otherwise the last prose block, skipping code blocks. Escape stops. Click-a-word-to-start is not implemented. Whether highlighting follows speech with Natural voices is untested. Edge native Read Aloud remains on Ctrl+Shift+U.

<!-- companion-voice-passage-symbols-TB-015 -->

## Voice dropdown, passage buttons and symbols - TB-013 to TB-017

RecordedAt 2026-11-25T19:39:59.3572676-05:00

TB-013 and TB-014 USER_REPORTED_BASIC_PASS: the user reports that the Hide / Show site UI toggle and the Read Aloud button work.

TB-015 IMPLEMENTED_PENDING_BROWSER_TEST: the Voice control is a dropdown of English voices only, Natural en-US first.

TB-016 IMPLEMENTED_PENDING_BROWSER_TEST: Previous and Next passage buttons (pilcrow with triangle) move between paragraph-level passages while reading.

TB-017 IMPLEMENTED_PENDING_BROWSER_TEST: toolbar buttons use symbols with the full label as hover text and accessible name. Glyph rendering is unverified.

Reload the extension and the page to test.

<!-- companion-bar-layout-TB-019 -->

## Voice label and full-width bar - TB-018 to TB-020

RecordedAt 2026-11-25T19:45:18.9654257-05:00

TB-018 USER_REPORTED_PARTIAL: the voice dropdown works; the closed display was not liked.

TB-019 IMPLEMENTED_PENDING_BROWSER_TEST: the voice control always shows Voice; names appear only in the dropdown list, with a check mark on the current voice.

TB-020 IMPLEMENTED_PENDING_BROWSER_TEST: the bar is full width, has no title, and uses larger buttons and glyphs. It overlays page content and does not reserve space.

Reload the extension and the page to test.

<!-- companion-stop-order-TB-022 -->

## Stop always shown and button order - TB-021 to TB-023

RecordedAt 2026-11-25T19:48:39.2497096-05:00

TB-021 USER_REPORTED_BASIC_PASS: the user reports the toolbar looks good after the layout change.

TB-022 IMPLEMENTED_PENDING_BROWSER_TEST: the Stop button is always shown and disabled while idle, so other buttons no longer shift.

TB-023 IMPLEMENTED_PENDING_BROWSER_TEST: the Hide / Show site UI button is first.

Reload the extension and the page to test.

<!-- companion-settings-TB-025 -->

## Settings group, jump to bottom and dock requirement - TB-024 to TB-027

RecordedAt 2026-11-25T19:53:31.8357703-05:00

TB-024 USER_REPORTED_BASIC_PASS: the user reports the Stop and button-order changes are better.

TB-025 IMPLEMENTED_PENDING_BROWSER_TEST: a settings button opens a second row with Voice, speed, Clear feedback and Inspector. Inspector uses a new symbol.

TB-026 IMPLEMENTED_PENDING_BROWSER_TEST: a main-toolbar button scrolls the thread to the bottom.

TB-027 REQUIREMENT_RECORDED_NOT_IMPLEMENTED: dock the toolbar at the bottom of the window with the prompt box above it. Needs a layout probe first.

Reload the extension and the page to test.

<!-- companion-dock-TB-028 -->

## Bottom dock - ENV-006 and TB-028

RecordedAt 2026-11-25T19:55:54.4389307-05:00

ENV-006: shrinking the app container (div.isolate.flex.h-dvh) moves the prompt box up by the same amount; changes to html, body and #root do not. The thread scrolls in div.scrollable-container.

TB-028 IMPLEMENTED_PENDING_BROWSER_TEST: the toolbar is docked at the bottom by default with the prompt box above it. It falls back to the top if the layout selector does not match exactly one element. A toggle in the settings row switches between top and bottom.

Reload the extension and the page to test.

<!-- companion-widen-only-TB-030 -->

## Widened buttons and follow-up box requirement - TB-029 to TB-031

RecordedAt 2026-11-25T20:04:14.1806366-05:00

TB-029 USER_REPORTED_BASIC_PASS: the user reports the toolbar looks good, with the bottom dock, and all buttons work.

TB-030 IMPLEMENTED_PENDING_BROWSER_TEST: buttons stretch evenly to fill the bar. No new buttons were added.

TB-031 REQUIREMENT_RECORDED_NOT_IMPLEMENTED: hide the box of suggested follow-up prompts shown below some answers. Needs a markup probe first.

Reload the extension and the page to test.

<!-- companion-hide-suggest-TB-033 -->

## Hide suggested follow-ups - TB-032, ENV-007 and TB-033

RecordedAt 2026-11-25T20:08:04.7822380-05:00

TB-032 USER_REPORTED_BASIC_PASS: the user reports the passage buttons work.

ENV-007: the suggested follow-up box is a classless div after the answer entry, holding rows with the class tokens isolate, -mx-3, flex and items-start.

TB-033 IMPLEMENTED_PENDING_BROWSER_TEST: the box is hidden by default; a toggle in the settings row shows or hides it. It matches by row structure and hides nothing if the structure changes.

Reload the extension and the page to test.

<!-- companion-results2-TB-035 -->

## Spacing and Read Aloud results - TB-034 and TB-035

RecordedAt 2026-11-25T20:15:32.8321260-05:00

TB-034 USER_REPORTED_BASIC_PASS: the user reports the button spacing is good.

TB-035 USER_REPORTED_BASIC_PASS: the user reports Read Aloud works great in both the Companion and the DoDA-Unity Doc Reader. Which control was used in each app was not itemized.

RecordedAt 2026-11-25T21:14:30.2128178-05:00

TB-036 SCRIPT_VERIFIED_PENDING_BROWSER_TEST: Native Messaging host native-host\DoDAIseRunnerHost.exe (source DoDAIseRunnerHost.cs) is registered for Edge under HKCU com.doda.ise_runner with allowed origin chrome-extension://akapcolhkcjmdpimnkfbmpchmaeiipch/. It picks the oldest powershell_ise process by start time, focuses it, sends Ctrl+N, Ctrl+I and Ctrl+V, and presses F5 only when asked. Script tests: at about 21:05 a pasted Set-Content line ran in ISE pid 26704 and created a proof file. In this completion run ping and peek (clipboard length, lines, first line, SHA-256) passed, run-clipboard refused a wrong hash, and run-clipboard with the right hash ran in ISE and created the proof file after 2.3 s. Attempts at about 21:00 to 21:04 pasted into the ISE console because the Script pane was collapsed and F5 did nothing; adding Ctrl+I fixed it. Host sha256 6DF5D6E0FB68ABED708217D2A3702038CE7DE11541542C7E50FA23D81FA0F302. Limitations: Tested from scripts only, not from the browser. ISE must be idle and the host cannot detect a busy ISE. Keystrokes depend on ISE shortcuts and on the ISE window staying in front; the Script pane expands during a run. Only the oldest ISE window is targeted. The run action overwrites the clipboard. Not tested with long multi-line scripts. The Stage 2 file changes were applied at 21:09:39 by a script whose report was not captured; the checks above were run afterwards.

TB-037 IMPLEMENTED_PENDING_BROWSER_TEST: manifest.json gains the nativeMessaging permission. background.js relays messages from perplexity.ai tabs of this extension only and allows only peek, run and run-clipboard. inspect.js adds a Run in ISE button beside Copy this block and a Run clipboard button after Copy in the toolbar, and moves Show/Hide site UI into the settings row. Both run buttons ask for confirmation showing lines, characters and first line. This changes the earlier boundary of no code execution automation (launcher description and the Copy this block tooltip) at the user explicit request on 2026-11-25. inspect.js sha256 before D5B1E4441D2E7A07BD1D789E6DCB875A23AF9DA09111E79DF87CADAC2AE7CF82, after FAAAB1D3A4BB59AFAF13DC3FDE4B00FB5199ABF5D0B0F0C69976966710CB7259. Original files are in the stage2-20261125-210939 backup folder. Limitations: Not browser tested. JS syntax: node --check passed for inspect.js and background.js. The extension must be reloaded in edge://extensions and Edge may disable it until the new permission is accepted. The confirmation shows length, line count and first line, not the full text. The launcher description text still says no code execution automation until the launcher is rebuilt.

RecordedAt 2026-11-25T21:19:45.8174630-05:00

TB-038 USER_REPORTED_BASIC_PASS: User reported at about 21:16 that the Run in ISE button appears and that they used it in the browser to run the Stage 2 completion script in ISE; the script report they pasted (BLOCKED: hash changed since the drift check, README.md) came from that run. At about 21:17 the user answered yes to items 1, 2, 3 and 5 of a four-item list: the confirmation dialog appears, Run clipboard appears in the bottom toolbar, Show/Hide site UI is in the settings row, and an item numbered 5 that does not map to the list (probably item 4, ISE window focus and layout). Confirms TB-037 at a basic level. Limitations: User-reported and not itemized. The mapping of item 5 is unresolved. A Run clipboard click-through into ISE was not separately described, and whether Show/Hide site UI still works from Settings was not explicitly reported. TB-037 is preserved as the implementation record.

TB-039 IMPLEMENTED_PENDING_BROWSER_TEST: inspect.js gains two toggles in the settings row, Run in ISE: confirm / no confirm and Run clipboard: confirm / no confirm. Each is stored in the page local storage (preader.skipConfirmRun and preader.skipConfirmClip), defaults to confirm, and when set skips only the window.confirm dialog for that button. Run clipboard still reads the clipboard through the host first and sends the preview hash, so a clipboard that changes between steps is still refused. The status line still reports characters sent. Requested by the user as option A on 2026-11-25. inspect.js sha256 before FAAAB1D3A4BB59AFAF13DC3FDE4B00FB5199ABF5D0B0F0C69976966710CB7259, after FC87565353A077F124356F159C8E8554BB67771D8FBF2632240EBF2B73616707. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\toggles-20261125-211945. Limitations: Not browser tested. JS syntax: node --check passed for inspect.js. With a toggle set, one click runs the code with no preview; Run clipboard runs whatever is on the clipboard. Setting is per browser profile and per site origin. The extension must be reloaded in edge://extensions and the page refreshed.

RecordedAt 2026-11-25T21:23:06.1904143-05:00

TB-040 USER_REPORTED_PARTIAL: User reported at about 21:21 that the two confirmation toggle buttons appear in the Settings row. Toggle clicking, skipping the dialog, persistence after refresh, and Run clipboard remaining guarded were not reported. Limitations: User-reported and partial: placement only. Behavior of TB-039 remains untested in the browser.

TB-041 IMPLEMENTED_PENDING_BROWSER_TEST: inspect.js gains Run last block, shown as the glyph U+25B6 with text selector U+FE0E and the tooltip Run last block in ISE, placed after Run clipboard in the bottom toolbar. It takes the code from lastBlock() (the same finder as Copy last loaded block), honors the Run in ISE confirm toggle (preader.skipConfirmRun), shows lines, characters and first line in the dialog when confirmation is on, and refuses to send if the last block changed while confirming. Sends action run with execute true through the same host path as Run in ISE. The toggle block was also moved onto its own line. inspect.js sha256 before FC87565353A077F124356F159C8E8554BB67771D8FBF2632240EBF2B73616707, after 8E4AC9DC540DB2BFF1EB8A1A41BAED5E5F957A9AEEFBC2BA71E9A5FFE54547AE. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\runlast-20261125-212306. Limitations: Not browser tested. JS syntax: node --check passed for inspect.js. With the Run in ISE toggle set to no confirm, one click runs the last matching block with no preview. lastBlock() only finds rendered blocks with a figure caption and exactly one code element, so it may not be the newest code on the page. The extension must be reloaded and the page refreshed.

RecordedAt 2026-11-25T21:28:45.1890683-05:00

TB-042 USER_REPORTED_PARTIAL: At 21:24:02 the Run last block button ran the harmless test script in ISE (pid 26704, PowerShell 5.1.26100.10068, 1 console tab named PowerShell 1) and the user pasted the console output, which ended at the prompt with Nothing was changed. The user reported at about 21:25 that the Run last block glyph is the play triangle U+25B6, that it is the same glyph as the Read Aloud button, and that one must change. The user also said the Run clipboard button is no longer necessary. The user said the lightning bolt works as the replacement glyph. Limitations: User-reported and partial. Whether the button used was Run last block was inferred from the user report. The confirmation dialog contents, the no-confirm toggle behavior, toggle persistence after refresh and the glyph rendering as plain text were not itemized. TB-039 and TB-041 remain implementation records.

TB-043 IMPLEMENTED_PENDING_BROWSER_TEST: inspect.js changes: the Run last block glyph is now U+26A1 with text selector U+FE0E, replacing U+25B6 which clashed with Read Aloud. The Run clipboard button, its handler, its skip-confirm flag and its Settings toggle are removed. The native host run-clipboard action and TB-037 are unchanged. The remaining toggle is labeled ISE runs: confirm / no confirm and governs Run in ISE and Run last block through preader.skipConfirmRun. inspect.js sha256 before 8E4AC9DC540DB2BFF1EB8A1A41BAED5E5F957A9AEEFBC2BA71E9A5FFE54547AE, after 53800D13A533263F8B51C4AA74EC7FF7718836426962C0E41372FF598DAC239E. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\bolt-20261125-212845. Limitations: Not browser tested. JS syntax: node --check passed for inspect.js. The preader.skipConfirmClip key may remain in browser local storage unused. The glyph may render differently in some fonts. The extension must be reloaded and the page refreshed.

RecordedAt 2026-11-25T21:31:03.9757911-05:00

TB-044 USER_REPORTED_PASS: At about 21:30, after reloading the extension and refreshing the page, the user reported success and that the confirmation toggle (TB-039), the Run last block button (TB-041) and the lightning glyph and Run clipboard removal change (TB-043) all pass. The user also withdrew the answer 5 recorded in TB-038: they do not know what it referred to, so TB-038 item mapping stays unresolved and item 4 (ISE window focus and layout) was not separately reported. This record adds a user-reported browser pass to TB-039, TB-041 and TB-043; their script-side implementation records are unchanged. Limitations: User-reported pass, not itemized per step. Persistence of the toggle after a page refresh, the dialog contents, and plain-text rendering of the lightning glyph were not individually reported. Launcher exe description still says no code execution automation. The native host run-clipboard action remains in the host without a toolbar button.

RecordedAt 2026-11-25T21:41:59.0001673-05:00

TB-045 IMPLEMENTED_PENDING_MANUAL_TEST: PerplexityCompanionLauncher.cs AssemblyDescription changed from no code execution automation to: Prompts for a Perplexity URL, then launches the existing Edge Default profile in app mode. This launcher does no code execution; any code execution is handled by the separate optional native host and extension. The launcher itself still does no code execution, so the old text was not false for the launcher, but it could be read as covering the whole project. AssemblyDescription appears as the Comments field in the exe version info; the File description field comes from AssemblyTitle and is unchanged. Rebuilt PerplexityCompanion.exe with csc.exe (sha256 46809206887326D2D24DB1EFF1F3064DE972C3451ABE766B49111450A5E08E00) using /target:winexe /optimize+ and references to System.Windows.Forms.dll and System.Drawing.dll; these flags were inferred, not read from an original build record. An earlier attempt at 21:41 compiled but failed its own check because the script looked in FileDescription instead of Comments; it was rolled back with no exe replaced. Launcher source sha256 before 925D6F1C571ACBFF9AF0B298896D8A4865E2434B014B2E6E37CAAA72D2A297A9, after 6E797B83BA91BF30FA030A3B7D672DC3B189EEFBBECBFDDFE43BF8AADBB1F624. Launcher exe sha256 before DD0ED1425B040630CFE7F06E0198B810B9B8680EDBFBA603608AE2FAE0947414, after 0C6DED45AA6548C5DD972812BAEE3DCF01ADB80538A2C7A7859D3F4425ED0CE3. New exe FileVersion 0.2.0.0. README lines 16 and 52 each gained a superseded-in-part note; the original sentences are preserved. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\launcher2-20261125-214158. Limitations: Not run: the rebuilt launcher has not been started or checked for the URL prompt and Edge app launch. Build flags were inferred, so an embedded icon or other original build options may differ from the old exe; no .ico was found in the repository. The old exe is in the backup folder.

RecordedAt 2026-11-25T22:05:07.5321306-05:00

TB-046 IMPLEMENTED_PENDING_BROWSER_TEST: Added the Result to prompt option. Host: DoDAIseRunnerHost.cs gains an await-clipboard action that does not need ISE; it polls the clipboard every 250 ms for up to timeoutMs (1000 to 30000, default 25000) for non-empty text whose SHA-256 differs from the run code, and returns the text (limit 200000 characters). background.js allows that action. inspect.js adds a Result to prompt on/off setting in the settings row, default off; when on, Run in ISE and Run last block wait up to four 25-second rounds for new clipboard text and add it to the prompt box through a paste event, falling back to insertText; it appends after any draft with a blank line and never submits; Run buttons refuse to start while a wait is in progress. Host rebuilt with csc.exe using target winexe (chosen from the old exe subsystem), optimize+, references System.Web.Extensions and System.Windows.Forms; these flags were inferred, and the new exe matched the old exe machine type and subsystem. Before installing, the temporary exe passed Native Messaging round trips from this script: await-clipboard changed case, unchanged case, and unknown action refused; peek ok=True and ping ok=True. Hashes before and after: inspect.js 53800D13A533263F8B51C4AA74EC7FF7718836426962C0E41372FF598DAC239E to B2F5D4700A8C4D624FE5A5B63410207B38DB914A18337022AC16BD2F537DD286; background.js 1BE9AF04646C4AE032A8B10ADEE87F9F46FA2D5196836C020C79250666D4BADC to 9285A435F71B0B9F6A99887E5CB2F4C38F0EF45D987AF39EF3E545CF53188FCF; host source 72B3D444EAD9FE401987B8CB3F7E9678D60A2845681A80282E125D22E53D747F to 9C8B45806DDD6FA009D88F9028A6EFBC7ACE90A0983406D1D786959F8DD2CD0D; host exe 6DF5D6E0FB68ABED708217D2A3702038CE7DE11541542C7E50FA23D81FA0F302 to 29FA7D93355A569FFF31A75023A937FD337003CC11415E465DE391F5233EACCA. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\result-20261125-220505. Limitations: Not tested in the browser. Reload the extension and refresh the Perplexity page first. The paste-event insertion into the Lexical composer is untested; the fallback is insertText. The wait ends at the first clipboard text that differs from the run code, so a script that never sets the clipboard times out after about 100 seconds and an unrelated copy during the wait would be taken as the result. While waiting, the Run buttons are blocked; reloading the page cancels the wait. Output sent to the prompt box may contain local paths and other machine details; it is only inserted when the setting is on, and never submitted. The host AssemblyDescription text was not updated. Shipped manifest unchanged (no new permission).

RecordedAt 2026-11-25T22:10:14.2436971-05:00

TB-048 IMPLEMENTED_PENDING_BROWSER_TEST: User report for TB-046: after running the harmless test script (its report was pasted at about 22:07:37 on 2026-11-25), the user wrote at about 22:08 that it worked but it did not hit enter or send the results. That matches the design: results are inserted and not submitted. Which Run button was used and the status text were not reported, and the no-clipboard timeout test was not reported. New in TB-048: inspect.js adds an Auto-send result on/off setting, default off, in the settings row; turning it on asks for confirmation. When Result to prompt is on and Auto-send is on, after a successful insert the extension clicks Submit only if the prompt box was empty before the insert, exactly one visible Submit button exists and becomes enabled within 2 seconds, and the composer text equals the result ignoring whitespace; otherwise it leaves the text in the box and reports why. Success message: Sent N characters of script output. Delivery is not verified. inspect.js sha256 before B2F5D4700A8C4D624FE5A5B63410207B38DB914A18337022AC16BD2F537DD286, after 321FD337B489984A72B3F242954803CE9ADE679D23D8F34632FC3E2ED46512CF. Backup folder E:\Dev\PerplexityReaderCompanion-Backups\autosend-20261125-221014. Limitations: Not tested in the browser. Reload the extension and refresh the Perplexity page. Submitted text is not reviewed; script output can contain local paths and other machine details. The composer text comparison ignores whitespace because the editor splits lines into paragraphs. A clipboard change from another application during the wait would be treated as the result and sent when auto-send is on. Delivery is not verified. Host, relay and manifest unchanged.

RecordedAt 2026-11-25T22:14:07.0034123-05:00

TB-049 USER_REPORTED_PARTIAL: User-reported browser results, 2026-11-25, with the extension reloaded and Result to prompt on: at about 22:07 a harmless test script run from ISE returned its five-line report to the prompt box; at about 22:08 the user wrote that it worked but did not send (insert only, as designed in TB-046); after the Auto-send result setting of TB-048 was added, the user reported at about 22:12 that the report of the 22:11 run (a hash-guard BLOCKED message) was sent automatically from PowerShell ISE; at about 22:12 a read-only script that copied lines 59 to 90 of reader.js returned a message with the file path, sha256 7E24C6798AF115292E700789CCE674BA0B9F1164EDC084F57A6D1D63C3CEE597, total lines 763, and the 32 numbered code lines intact. Together these show that Run in ISE or Run last block, the host clipboard wait, insert into the composer, and submit worked in the user browser. Limitations: Not tested or not reported: the draft-present case (should insert and not send); the no-clipboard timeout case (about 100 seconds, nothing inserted); output near the 200000-character limit; the Submit-not-found and text-mismatch paths; which Run button was used for each run and the exact status text shown; whether the paste event or the insertText fallback inserted the text. Delivery of submitted messages is not verified by the extension. Script output can contain local paths and other machine details; auto-send submits without review.

## Run in ISE tab reuse and wording - 2026-11-26

Editable sources: inspect.js and the native host source. Maintained records: README.md and verification.csv (TB-050, TB-051). DoDA register entries: NA-189 to NA-195.

The native host now selects all before pasting, so Run in ISE overwrites the selected ISE tab instead of opening a new one. The tooltip and both confirmation dialogs in inspect.js were reworded to say so.

- TB-050: USER_REPORTED_PARTIAL. Two test scripts reported one open script tab each; one tab and one window only.
- TB-051: IMPLEMENTED_PENDING_BROWSER_TEST. The extension reload and the displayed text have not been reported.
- The button overwrites a real file open in the selected tab until it is saved. Multi-tab and multi-window behavior is untested.
- The README and verification.csv were not updated for the earlier host patch until this entry.

## Run in ISE wording browser result - 2026-11-26

Maintained records: README.md and verification.csv (TB-052). DoDA register entries: NA-196 and NA-197.

- TB-052: USER_REPORTED_PARTIAL. The user reported the tooltip is corrected; the confirmation dialog text was not reported.
- The user does not use several ISE tabs, so multi-tab guards are deferred until the user reports otherwise.

## Backup location and underscore rule - 2026-11-26

Maintained records: README.md and verification.csv (TB-053). DoDA register entry: NA-198.

Chrome rejects an unpacked extension that contains a file or folder whose name starts with an underscore, so backup folders must not sit inside this folder with such names. Backups now go to E:\Dev\PerplexityReaderCompanion-backups with names that do not start with an underscore.

- Four _backup folders were moved there on 2026-11-26 with the leading underscore removed; earlier records keep the old names as originally written.
- TB-053: IMPLEMENTED_PENDING_BROWSER_TEST. The extension has not been reloaded after the move.

## Extension load after backup relocation - 2026-11-26

Maintained records: README.md and verification.csv (TB-054). DoDA register entry: NA-199.

- TB-054: USER_REPORTED_BASIC_PASS. The extension loaded successfully after the backup folders were moved out of the extension folder; no per-feature recheck was reported.
- The user stated the local Unity documentation is 6.3 (6000.3); this was not verified by file inspection.

## Toolbar quick reply: All tests successful - 2026-11-26

Maintained records: README.md and verification.csv (TB-055).

- TB-055: IMPLEMENTED_PENDING_BROWSER_TEST. The Copy last loaded block toolbar button was removed. A new quick-reply button (U+2705, text: All tests successful.) sits directly after the yes / approved / go button and uses the same insert-and-send path and draft protection.
- Not changed: per-block Copy this block buttons, the inspector Copy report button, and the Run last block button.
- Reload the extension at chrome://extensions and refresh the Perplexity tab before testing.

- TB-056: USER_REPORTED_BASIC_PASS. A message with the exact text All tests successful. arrived after TB-055, read as one use of the new toolbar button. Draft refusal, toolbar order and removal of the copy button were not reported.

## Toolbar quick reply label: thumbs up - 2026-11-26

Maintained records: README.md and verification.csv (TB-057).

- TB-057: IMPLEMENTED_PENDING_BROWSER_TEST. The yes / approved / go quick-reply button now shows the Unicode thumbs-up (U+1F44D). Its tooltip and sent text are unchanged. Reload the extension and refresh the Perplexity tab before testing.

- TB-058: USER_REPORTED_BASIC_PASS (inferred). A message with the exact text yes / approved / go arrived after TB-057, read as one use of the thumbs-up button. Rendering, toolbar order, draft refusal and removal of the copy button were not reported.

- TB-059: USER_REPORTED_BASIC_PASS. The user confirmed the TB-058 message came from the thumbs-up button, and reported the open toolbar checks as passed using the all-tests-successful button. No per-check detail; draft refusal not individually confirmed.
