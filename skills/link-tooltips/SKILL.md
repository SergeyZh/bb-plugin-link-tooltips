---
name: link-tooltips
description: Explain or troubleshoot Link Tooltips, which shows link URLs and file paths on mouse hover in BB.
---

Link Tooltips runs automatically in each BB desktop window and remote browser
client. Hover an ordinary link and wait for the browser's native title tooltip.
File URLs show decoded paths, including line fragments; web URLs remain exact.
Existing title text is preserved above the destination. It covers old and new
messages without changing their contents or navigation.

There are no plugin settings, custom CLI commands, storage, or network calls.
Check `bb plugin list` for plugin ID `link-tooltips`. Disable it with
`bb plugin disable link-tooltips` and enable it with
`bb plugin enable link-tooltips` when requested by the user.

Fragment-only links, buttons, and content inside embedded browser pages are not
covered. Native tooltips require a mouse and have a browser-controlled delay.
