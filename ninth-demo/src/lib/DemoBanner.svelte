<!-- Portfolio notice shown at the bottom of every demo. -->
<div class="demo" role="note" aria-label="Demo site notice">
  <span class="tag">DEMO</span>
  <span class="txt">Portfolio demo · fictional brand · not a real product</span>
</div>

<style>
  .demo { position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; gap: 14px;
    height: calc(46px + env(safe-area-inset-bottom)); padding: 0 14px env(safe-area-inset-bottom); color: #111;
    font: 800 22px/1 system-ui, -apple-system, sans-serif; letter-spacing: .14em; text-transform: uppercase;
    background: repeating-linear-gradient(-45deg, #ffd400 0 22px, #ffc400 22px 44px); border-top: 3px solid #111; box-shadow: 0 -6px 18px rgba(0,0,0,.25); }
  .tag { background: #111; color: #ffd400; padding: 6px 12px; border-radius: 4px; font-size: 20px; letter-spacing: .2em; }
  .txt { font-size: 13px; letter-spacing: .06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 560px) { .txt { font-size: 11px; } }
</style>
