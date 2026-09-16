# shadcn visual comparison

Before: `5a4f71ddf15a5434044e90c4e0e2eddfc6c759ce` (PR merge base).

After UI source: `ad0813b4e80a36a3959157bf4b5394fdd58a8796`. Later commits in this PR only add review evidence.

Inputs use the stock 32px height instead of 36px and lose the custom shadow; form spacing shifts slightly. The jade theme and page layout are preserved.

Manually compared matching desktop (1280×800) and mobile (390×844) viewports in Chromium, light theme, reduced motion. No horizontal overflow or unexpected clipping was observed in the sampled after states. This covers the pages/states below, not every screen, authenticated flow, or dark-mode state.

## Empty login form

App: `web`. Route: `/login`. Same route and state on both commits.

Desktop

| Before                              | After                             |
| ----------------------------------- | --------------------------------- |
| ![Before](login-desktop-before.png) | ![After](login-desktop-after.png) |

Mobile

| Before                             | After                            |
| ---------------------------------- | -------------------------------- |
| ![Before](login-mobile-before.png) | ![After](login-mobile-after.png) |
