---
layout: page
title: Tauren Docs
---

<section class="tauren-home" aria-labelledby="tauren-home-title">
  <div class="tauren-hero">
    <div class="tauren-hero__content">
      <p class="tauren-eyebrow"><span class="tauren-mark" aria-hidden="true"></span>Tauren Docs</p>
      <h1 id="tauren-home-title">The command deck for transparent coding sessions.</h1>
      <p class="tauren-lede">
        Tauren is a VS Code interface for the Pi coding agent, focused on traceable sessions,
        visible tool use, and IDE-native workflows.
      </p>
      <div class="tauren-actions">
        <a class="tauren-button tauren-button--primary" href="/architecture/ui-language">Explore the architecture</a>
        <a class="tauren-button tauren-button--secondary" href="https://github.com/kaiwood/vscode-tauren">View on GitHub</a>
      </div>
    </div>
  </div>

  <div class="tauren-card-grid" aria-label="Documentation areas">
    <a class="tauren-card" href="/architecture/ui-language">
      <span class="tauren-card__icon">⌘</span>
      <strong>UI Language</strong>
      <span>Names and boundaries for Tauren's main UI surfaces.</span>
    </a>
    <a class="tauren-card" href="/decisions/0001-sdk-over-rpc">
      <span class="tauren-card__icon">◇</span>
      <strong>SDK Integration</strong>
      <span>Why Tauren runs Pi through the in-process SDK transport.</span>
    </a>
    <a class="tauren-card" href="/decisions/0002-three-lane-model">
      <span class="tauren-card__icon">☰</span>
      <strong>Three-lane Model</strong>
      <span>The interaction model behind sessions, transcript, and context.</span>
    </a>
    <a class="tauren-card" href="/decisions/0003-plugin-ui-bridge">
      <span class="tauren-card__icon">✦</span>
      <strong>Plugin UI Bridge</strong>
      <span>How Pi extension UI reaches the VS Code sidebar.</span>
    </a>
  </div>

  <footer class="tauren-footer">
    <div>
      <p class="tauren-footer__brand"><span class="tauren-mark" aria-hidden="true"></span>Tauren</p>
      <p>Transparent AI coding assistance for VS Code.</p>
    </div>
    <a href="https://github.com/kaiwood/vscode-tauren">GitHub</a>
  </footer>
</section>
