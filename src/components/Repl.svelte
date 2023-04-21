<script lang="ts">
  import { onMount } from 'svelte';
  import { type Output, type Version, versions } from '../types';

  import { CodeJar } from 'codejar';
  import { type Theme, BUNDLED_THEMES } from 'shiki';
  import { getTheme, highlight, setTheme } from '../highlight';

  import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
  } from 'lz-string';

  let container: HTMLDivElement;
  let output = '...';
  let editor: CodeJar;

  let version: Version = versions[versions.length - 1];
  let theme: Theme = 'github-dark';

  $: (() => setTheme(theme))();

  onMount(() => {
    editor = CodeJar(container, highlight);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();

        const compressed = compressToEncodedURIComponent(editor.toString());
        localStorage.setItem('code', compressed);
        const url = `${origin}?#${compressed}`;
        navigator.clipboard.writeText(url);
      }
    });

    const url = new URL(document.URL).hash.slice(1);
    if (decompressAndSet(url)) return;

    const stored = localStorage.getItem('code');
    if (!stored) return;
    decompressAndSet(stored);
  });

  function decompressAndSet(compressed: string) {
    try {
      const code = decompressFromEncodedURIComponent(compressed);
      if (code) editor.updateCode(code);
      else return false;
      return true;
    } catch {}
  }

  async function run() {
    const res = await fetch('/execute', {
      body: editor.toString(),
      method: 'POST',
      headers: { 'x-sm-version': version },
    });
    if (!res.ok) {
      const err = await res.text();
      output = getTheme(theme).ansiToHtml(err);
      return;
    }
    const o = (await res.json()) as Output;
    output = getTheme(theme).ansiToHtml(o.run.output);
  }
</script>

<button class="run" on:click={run}>Run Code</button>
<select name="version" id="version" bind:value={theme}>
  {#each BUNDLED_THEMES as t}
    {#if t !== 'css-variables'}
      <option value={t}>{t}</option>
    {/if}
  {/each}
</select>
<select name="version" id="version" bind:value={version}>
  {#each versions as v}
    <option value={v}>{v}</option>
  {/each}
</select>
<div class="container">
  <div id="repl" class="editor" bind:this={container}>
    {`=> * {\n\t"ball"!;\n}`}
  </div>
  <pre id="output">{@html output}</pre>
</div>

<style>
  :root {
    --font: 'Source Code Pro', monospace;
    --box-height: 19rem;
  }

  .container {
    display: grid;
    grid-template-columns: repeat(2, calc((100% - 1rem) / 2));
    gap: 1rem;
  }

  :global(.shiki) {
    height: calc(100% - 20px);
    margin: 0;
    padding: 10px;
  }

  #output {
    padding: 10px;
  }

  .editor,
  #output {
    border-radius: 6px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
      0 3px 1px -2px rgba(0, 0, 0, 0.2);

    font-family: var(--font);
    font-size: 14px;
    font-weight: 400;
    letter-spacing: normal;
    line-height: 20px;
    tab-size: 4;
    margin: 0;

    overflow: scroll;

    min-height: 30rem;
  }
</style>
