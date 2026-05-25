export const baseStyles = /* css */ `    :root {
      color-scheme: light dark;
      --tauren-code-foreground: var(--vscode-editor-foreground, var(--vscode-foreground));
      --tauren-code-background: var(--vscode-textCodeBlock-background, color-mix(in srgb, var(--vscode-foreground) 8%, transparent));
      --tauren-code-inline-background: var(--vscode-textPreformat-background, color-mix(in srgb, var(--vscode-foreground) 10%, transparent));
      --tauren-chat-inline-padding: 20px;
      --tauren-composer-min-height: 84px;
      --tauren-composer-bottom-margin: 1lh;
      --tauren-composer-custom-ui-clearance: 8px;
      --tauren-custom-ui-inline-offset: var(--tauren-chat-inline-padding);
      --tauren-custom-ui-bottom-offset: calc(var(--tauren-composer-bottom-margin) + var(--tauren-composer-min-height) + var(--tauren-composer-custom-ui-clearance));
      --tauren-custom-ui-viewport-bottom-reserve: 42px;
      --tauren-z-base: 0;
      --tauren-z-raised: 1;
      --tauren-z-tooltip: 2;
      --tauren-z-composer-menu: 3;
      --tauren-z-floating-panel: 4;
      --tauren-z-toast: 5;
      --tauren-z-popover: 10;
      --tauren-z-modal: 20;
      --tauren-ansi-black-fallback: #000000;
      --tauren-ansi-red-fallback: #cd3131;
      --tauren-ansi-green-fallback: #0dbc79;
      --tauren-ansi-yellow-fallback: #e5e510;
      --tauren-ansi-blue-fallback: #2472c8;
      --tauren-ansi-magenta-fallback: #bc3fbc;
      --tauren-ansi-cyan-fallback: #11a8cd;
      --tauren-ansi-white-fallback: #e5e5e5;
      --tauren-ansi-bright-black-fallback: #666666;
      --tauren-ansi-bright-red-fallback: #f14c4c;
      --tauren-ansi-bright-green-fallback: #23d18b;
      --tauren-ansi-bright-yellow-fallback: #f5f543;
      --tauren-ansi-bright-blue-fallback: #3b8eea;
      --tauren-ansi-bright-magenta-fallback: #d670d6;
      --tauren-ansi-bright-cyan-fallback: #29b8db;
      --tauren-ansi-bright-white-fallback: #e5e5e5;
    }

    * {
      box-sizing: border-box;
      max-width: 100%;
    }

    body * {
      min-width: 0;
    }

    html,
    body {
      width: 100%;
      max-width: 100%;
      height: 100%;
    }

    body {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      overflow-x: hidden;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    body.vscode-light {
      --tauren-ansi-yellow-fallback: #949800;
      --tauren-ansi-blue-fallback: #0451a5;
      --tauren-ansi-white-fallback: #555555;
      --tauren-ansi-bright-yellow-fallback: #795e26;
      --tauren-ansi-bright-white-fallback: #222222;
    }

    .tauren-view {
      --tauren-lane-transition-duration: 190ms;
      --tauren-lane-transition-easing: cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: 100%;
      max-width: 100%;
      height: 100vh;
      padding: 0;
      min-width: 0;
      min-height: 0;
      /* Clip lanes without making the host horizontally scrollable during scrollIntoView calls. */
      overflow: hidden;
      overflow: clip;
    }

`;
