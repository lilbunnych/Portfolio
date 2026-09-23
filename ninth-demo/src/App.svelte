<script lang="ts">
  import { onMount } from 'svelte'
  import { app, persist, uid, chime, type Mode } from './lib/state.svelte'
  import DemoBanner from './lib/DemoBanner.svelte'

  const LABEL: Record<Mode, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' }

  let mode = $state<Mode>('focus')
  let running = $state(false)
  let endAt = 0
  let remaining = $state(app.settings.focus * 60 * 1000)
  let focusCount = $state(0)
  let draft = $state('')
  let showSettings = $state(false)
  let installEvent: any = $state(null)
  let isIOS = $state(false)
  let standalone = $state(false)

  const total = $derived(app.settings[mode] * 60 * 1000)
  const progress = $derived(1 - remaining / total)
  const mm = $derived(String(Math.floor(Math.ceil(remaining / 1000) / 60)).padStart(2, '0'))
  const ss = $derived(String(Math.ceil(remaining / 1000) % 60).padStart(2, '0'))
  const accent = $derived(mode === 'focus' ? 'var(--focus)' : 'var(--rest)')
  const R = 140, C = 2 * Math.PI * R

  // Stats
  const dayKey = (t: number) => new Date(t).toDateString()
  const todaySessions = $derived(app.sessions.filter(s => dayKey(s.at) === dayKey(Date.now())))
  const todayMinutes = $derived(todaySessions.reduce((a, s) => a + s.minutes, 0))
  const week = $derived.by(() => {
    const out = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const mins = app.sessions.filter(s => dayKey(s.at) === d.toDateString()).reduce((a, s) => a + s.minutes, 0)
      out.push({ label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), mins, today: i === 0 })
    }
    return out
  })
  const weekMax = $derived(Math.max(60, ...week.map(w => w.mins)))
  const streak = $derived.by(() => {
    let n = 0
    for (let i = 0; ; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const has = app.sessions.some(s => dayKey(s.at) === d.toDateString())
      if (has) n++; else if (i > 0) break
      if (i > 365) break
    }
    return n
  })
  const activeTitle = $derived(app.tasks.find(t => t.id === app.activeTask)?.title ?? 'No task selected')

  function setMode(m: Mode) {
    mode = m; running = false; remaining = app.settings[m] * 60 * 1000
  }
  function toggle() {
    if (running) { running = false; remaining = Math.max(0, endAt - Date.now()) }
    else { running = true; endAt = Date.now() + remaining }
  }
  function reset() { running = false; remaining = total }
  function skip() { complete(false) }

  function complete(natural = true) {
    running = false
    if (mode === 'focus') {
      if (natural) {
        app.sessions.push({ at: Date.now(), minutes: app.settings.focus, taskId: app.activeTask })
        persist()
      }
      focusCount += 1
      setMode(focusCount % app.settings.longEvery === 0 ? 'long' : 'short')
    } else {
      setMode('focus')
    }
    if (natural && app.settings.sound) chime()
  }

  function addTask(e: SubmitEvent) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    const t = { id: uid(), title, done: false }
    app.tasks.unshift(t)
    if (!app.activeTask) app.activeTask = t.id
    draft = ''
    persist()
  }
  function removeTask(id: string) {
    app.tasks = app.tasks.filter(t => t.id !== id)
    if (app.activeTask === id) app.activeTask = app.tasks.find(t => !t.done)?.id ?? null
    persist()
  }
  const doneCount = (id: string) => app.sessions.filter(s => s.taskId === id).length

  onMount(() => {
    const id = setInterval(() => {
      if (!running) return
      remaining = Math.max(0, endAt - Date.now())
      if (remaining === 0) complete(true)
    }, 200)
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input')) return
      if (e.code === 'Space') { e.preventDefault(); toggle() }
      if (e.key === 'r') reset()
    }
    addEventListener('keydown', onKey)
    addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e })
    isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    standalone = matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
    return () => { clearInterval(id); removeEventListener('keydown', onKey) }
  })

  $effect(() => { document.title = running ? `${mm}:${ss} · ${LABEL[mode]}` : 'Tempo | Focus timer' })
</script>

<div class="shell" style="--accent:{accent}">
  <header class="top">
    <div class="brand"><img src="./icon.svg" alt="" width="28" height="28" /> Tempo</div>
    <div class="top-actions">
      {#if installEvent && !standalone}
        <button class="ghost" onclick={async () => { installEvent.prompt(); installEvent = null }}>Install app</button>
      {:else if isIOS && !standalone}
        <span class="hint">Share, then “Add to Home Screen” to install</span>
      {/if}
      <button class="icon" aria-label="Settings" aria-expanded={showSettings} onclick={() => (showSettings = !showSettings)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
      </button>
    </div>
  </header>

  {#if showSettings}
    <section class="panel settings" aria-label="Settings">
      {#each [['focus', 'Focus', 5, 90], ['short', 'Short break', 1, 30], ['long', 'Long break', 5, 60]] as [key, label, min, max]}
        <label>
          <span>{label}</span>
          <input type="range" min={min} max={max} step="1" bind:value={app.settings[key as Mode]}
            onchange={() => { persist(); if (!running && mode === key) remaining = app.settings[mode] * 60000 }} />
          <b>{app.settings[key as Mode]} min</b>
        </label>
      {/each}
      <label class="check"><input type="checkbox" bind:checked={app.settings.sound} onchange={persist} /> Chime when a session ends</label>
    </section>
  {/if}

  <main class="grid">
    <section class="timer panel">
      <div class="modes" role="tablist" aria-label="Timer mode">
        {#each Object.entries(LABEL) as [m, label]}
          <button role="tab" aria-selected={mode === m} class:on={mode === m} onclick={() => setMode(m as Mode)}>{label}</button>
        {/each}
      </div>

      <div class="dial">
        <svg viewBox="0 0 320 320" aria-hidden="true">
          <circle cx="160" cy="160" r={R} class="track" />
          <circle cx="160" cy="160" r={R} class="bar" stroke-dasharray={C} stroke-dashoffset={C * (1 - progress)} />
        </svg>
        <div class="readout">
          <time class="clock" aria-live="off">{mm}:{ss}</time>
          <p class="task">{mode === 'focus' ? activeTitle : 'Stand up, look far away'}</p>
        </div>
      </div>

      <div class="controls">
        <button class="ghost" onclick={reset} aria-label="Reset timer">Reset</button>
        <button class="primary" onclick={toggle}>{running ? 'Pause' : remaining < total ? 'Resume' : 'Start'}</button>
        <button class="ghost" onclick={skip} aria-label="Skip to next session">Skip</button>
      </div>
      <p class="keys">Space to start or pause, R to reset</p>
    </section>

    <section class="panel tasks">
      <h2>Tasks</h2>
      <form onsubmit={addTask} class="add">
        <label for="new-task" class="sr">New task</label>
        <input id="new-task" bind:value={draft} placeholder="What are you working on?" maxlength="80" />
        <button class="primary small" disabled={!draft.trim()}>Add</button>
      </form>
      {#if app.tasks.length === 0}
        <p class="empty">No tasks yet. Add one above and pick it before you start.</p>
      {/if}
      <ul>
        {#each app.tasks as t (t.id)}
          <li class:active={app.activeTask === t.id} class:done={t.done}>
            <input type="checkbox" bind:checked={t.done} onchange={persist} aria-label="Mark “{t.title}” done" />
            <button class="title" onclick={() => { app.activeTask = t.id; persist() }} aria-pressed={app.activeTask === t.id}>{t.title}</button>
            {#if doneCount(t.id)}<span class="count" title="Focus sessions">{doneCount(t.id)}×</span>{/if}
            <button class="del" aria-label="Delete “{t.title}”" onclick={() => removeTask(t.id)}>×</button>
          </li>
        {/each}
      </ul>
    </section>

    <section class="panel stats">
      <h2>This week</h2>
      <div class="kpis">
        <div><b>{todayMinutes}</b><span>min today</span></div>
        <div><b>{todaySessions.length}</b><span>sessions today</span></div>
        <div><b>{streak}</b><span>day streak</span></div>
      </div>
      <div class="bars" role="img" aria-label="Focus minutes for the last seven days">
        {#each week as d}
          <div class="col">
            <div class="b" class:today={d.today} style="height:{Math.max(4, (d.mins / weekMax) * 100)}%" title="{d.mins} min"></div>
            <span>{d.label}</span>
          </div>
        {/each}
      </div>
      <p class="note">Earlier days are sample data.</p>
    </section>
  </main>
</div>
<DemoBanner />

<style>
  .shell { max-width: 1120px; margin: 0 auto; padding: max(1rem, env(safe-area-inset-top)) 1rem 5.5rem; }
  .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .brand { display: flex; align-items: center; gap: .6rem; font-weight: 700; font-size: 1.2rem; }
  .top-actions { display: flex; align-items: center; gap: .5rem; }
  .hint { font-size: .8rem; color: var(--muted); }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 1.25rem; padding: 1.25rem; }
  h2 { font-size: .95rem; color: var(--muted); font-weight: 600; margin-bottom: 1rem; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

  .grid { display: grid; gap: 1rem; }
  @media (min-width: 900px) {
    .grid { grid-template-columns: 1.25fr 1fr; grid-template-rows: auto auto; }
    .timer { grid-row: span 2; }
  }

  .modes { display: flex; gap: .25rem; padding: .25rem; background: var(--panel-2); border-radius: 999px; width: fit-content; margin: 0 auto; }
  .modes button { border: 0; background: none; padding: .55rem 1rem; border-radius: 999px; color: var(--muted); font-weight: 500; font-size: .9rem; transition: all .25s; }
  .modes button.on { background: var(--accent); color: #fff; }

  .dial { position: relative; width: min(78vw, 360px); aspect-ratio: 1; margin: 1.75rem auto 1.25rem; }
  .dial svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .track { fill: none; stroke: var(--panel-2); stroke-width: 14; }
  .bar { fill: none; stroke: var(--accent); stroke-width: 14; stroke-linecap: round; transition: stroke-dashoffset .25s linear, stroke .3s; }
  .readout { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; gap: .5rem; padding: 0 3rem; }
  .clock { font-family: var(--mono); font-weight: 300; font-size: clamp(3.5rem, 15vw, 5.25rem); letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
  .task { color: var(--muted); font-size: .95rem; }

  .controls { display: flex; justify-content: center; gap: .75rem; }
  button.primary { border: 0; background: var(--accent); color: #fff; font-weight: 600; padding: .9rem 2.25rem; border-radius: 999px; min-width: 9rem; transition: transform .12s, filter .2s; }
  button.primary:hover { filter: brightness(1.08); }
  button.primary:active { transform: scale(.97); }
  button.primary:disabled { opacity: .4; cursor: default; }
  button.primary.small { padding: .6rem 1.1rem; min-width: 0; }
  button.ghost { border: 1px solid var(--line); background: none; padding: .9rem 1.25rem; border-radius: 999px; color: var(--muted); }
  button.ghost:hover { color: var(--text); border-color: var(--muted); }
  button.icon { border: 1px solid var(--line); background: none; width: 2.6rem; height: 2.6rem; border-radius: 999px; display: grid; place-items: center; color: var(--muted); }
  .keys { text-align: center; margin-top: 1rem; font-size: .8rem; color: var(--muted); }
  @media (hover: none) { .keys { display: none; } }

  .add { display: flex; gap: .5rem; margin-bottom: .75rem; }
  .add input { flex: 1; min-width: 0; background: var(--panel-2); border: 1px solid transparent; border-radius: .8rem; padding: .7rem .9rem; outline: none; }
  .add input:focus { border-color: var(--accent); }
  .tasks ul { list-style: none; display: grid; gap: .25rem; }
  .tasks li { display: flex; align-items: center; gap: .6rem; padding: .55rem .6rem; border-radius: .8rem; }
  .tasks li.active { background: var(--panel-2); box-shadow: inset 3px 0 0 var(--accent); }
  .tasks li.done .title { text-decoration: line-through; color: var(--muted); }
  .tasks input[type=checkbox] { width: 1.1rem; height: 1.1rem; accent-color: var(--accent); }
  .title { flex: 1; text-align: left; border: 0; background: none; padding: .2rem 0; }
  .count { font-family: var(--mono); font-size: .8rem; color: var(--accent); }
  .del { border: 0; background: none; color: var(--muted); font-size: 1.25rem; width: 1.8rem; height: 1.8rem; border-radius: .5rem; }
  .del:hover { background: var(--panel-2); color: var(--text); }
  .empty { color: var(--muted); font-size: .9rem; padding: .5rem 0; }

  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
  .kpis div { display: flex; flex-direction: column; }
  .kpis b { font-family: var(--mono); font-size: 1.75rem; font-weight: 400; }
  .kpis span { font-size: .8rem; color: var(--muted); }
  .bars { display: grid; grid-template-columns: repeat(7, 1fr); gap: .5rem; height: 120px; margin-top: 1.25rem; align-items: end; }
  .col { display: flex; flex-direction: column; align-items: center; gap: .35rem; height: 100%; justify-content: flex-end; }
  .b { width: 100%; max-width: 28px; border-radius: 6px; background: var(--panel-2); transition: height .4s; }
  .b.today { background: var(--accent); }
  .col span { font-size: .75rem; color: var(--muted); }
  .note { margin-top: .75rem; font-size: .75rem; color: var(--muted); }

  .settings { display: grid; gap: .9rem; margin-bottom: 1rem; }
  .settings label { display: grid; grid-template-columns: 7rem 1fr 4rem; align-items: center; gap: .75rem; font-size: .9rem; }
  .settings input[type=range] { accent-color: var(--accent); }
  .settings b { font-family: var(--mono); font-weight: 400; text-align: right; }
  .settings .check { grid-template-columns: auto 1fr; }
</style>
