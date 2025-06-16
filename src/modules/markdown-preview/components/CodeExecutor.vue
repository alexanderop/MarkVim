<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useEventListener, useDebounceFn } from '@vueuse/core'

interface Props {
  markdownHtml: string
}

const props = defineProps<Props>()

const root = ref<HTMLElement | null>(null)
const executedCodeBlocks = ref<Map<string, { output: string[], error: string | null }>>(new Map())

/**
 * Builds the HTML content for the sandboxed iframe.
 * This iframe will execute the user's code and send console messages back to the parent.
 */
const buildIframeContent = (code: string, lang: string, blockId: string) => {
  const isTypeScript = lang === 'typescript' || lang === 'ts';
  const transpiledCode = isTypeScript ? `
    (function() {
      try {
        let jsCode = \`${code.replace(/`/g, '\\`')}\`;
        jsCode = jsCode.replace(/interface\\s+[A-Za-z0-9_]+\\s*\\{[^\\}]*\\}/g, '');
        jsCode = jsCode.replace(/:\\s*[A-Za-z0-9_]+/g, '');
        jsCode = jsCode.replace(/const enum\\s+[A-Za-z0-9_]+\\s*\\{[^\\}]*\\}/g, '');
        jsCode = jsCode.replace(/private\\s+|public\\s+|protected\\s+/g, '');
        eval(jsCode);
      } catch (e) {
        console.error('Transpilation/Execution Error:', e);
      }
    })();
  ` : `
    (function() {
      try {
        ${code}
      } catch (e) {
        console.error('Execution Error:', e);
      }
    })();
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Code Execution</title>
        <style>
            body {
                font-family: monospace;
                margin: 0;
                padding: 10px;
                background: transparent;
                color: #f8f8f2;
            }
            pre { margin: 0; padding: 0; white-space: pre-wrap; word-break: break-all; }
            .log { color: #f8f8f2; }
            .error { color: #ff6a6a; }
            .warn { color: #ffd700; }
            .info { color: #6a5acd; }
        </style>
    </head>
    <body>
        <div id="output"></div>
        <script>
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalInfo = console.info;

            function postMessageToParent(type, message) {
                window.parent.postMessage({
                    type: 'console',
                    blockId: '${blockId}',
                    logType: type,
                    message: JSON.stringify(message)
                }, '*');
            }

            console.log = (...args) => {
                originalLog(...args);
                postMessageToParent('log', args);
            };
            console.error = (...args) => {
                originalError(...args);
                postMessageToParent('error', args);
            };
            console.warn = (...args) => {
                originalWarn(...args);
                postMessageToParent('warn', args);
            };
            console.info = (...args) => {
                originalInfo(...args);
                postMessageToParent('info', args);
            };

            window.addEventListener('error', (event) => {
                postMessageToParent('error', ['Uncaught Error:', event.message, event.filename, event.lineno, event.colno]);
                event.preventDefault();
            });

            window.addEventListener('unhandledrejection', (event) => {
                postMessageToParent('error', ['Unhandled Promise Rejection:', event.reason]);
                event.preventDefault();
            });

            try {
                ${transpiledCode}
            } catch (e) {
                console.error('Script Execution Error within iframe:', e);
            }
        </script>
    </body>
    </html>
  `;
};

/**
 * Handles messages coming from the sandboxed iframes.
 * It parses the console output and updates the component's state.
 */
const handleMessage = (event: MessageEvent) => {
  if (event.data.type === 'console' && event.data.blockId) {
    const { blockId, logType, message } = event.data;
    try {
      const parsedMessage = JSON.parse(message).map((arg: any) => {
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');

      if (!executedCodeBlocks.value.has(blockId)) {
        executedCodeBlocks.value.set(blockId, { output: [], error: null });
      }
      const blockState = executedCodeBlocks.value.get(blockId)!;

      if (logType === 'error') {
        blockState.error = parsedMessage;
      } else {
        blockState.output.push(`[${logType.toUpperCase()}] ${parsedMessage}`);
      }
      executedCodeBlocks.value = new Map(executedCodeBlocks.value);
    } catch (e) {
      console.error('Error parsing message from iframe:', e, event.data);
    }
  }
};

// Use useEventListener to automatically add and remove the event listener
useEventListener(window, 'message', handleMessage);

/**
 * Executes the code for a specific block within a new iframe.
 * It also sets up the display area for console logs.
 */
const executeCodeBlock = (code: string, lang: string, blockId: string) => {
  if (import.meta.client) {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = 'auto';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    iframe.srcdoc = buildIframeContent(code, lang, blockId);
    iframe.setAttribute('data-code-block-id', blockId);

    executedCodeBlocks.value.set(blockId, { output: [], error: null });

    const container = root.value?.querySelector(`[data-code-executor-id="${blockId}"]`);
    if (container) {
      const existingIframe = container.querySelector('iframe');
      if (existingIframe) {
        existingIframe.remove();
      }
      const existingOutput = container.querySelector('.console-output');
      if (existingOutput) {
        existingOutput.remove();
      }

      container.appendChild(iframe);

      const outputDiv = document.createElement('div');
      outputDiv.className = 'console-output mt-2 p-2 border border-border rounded-md bg-surface-primary text-xs font-mono max-h-40 overflow-y-auto';
      outputDiv.setAttribute('data-console-output-for', blockId);
      container.appendChild(outputDiv);

      watch(() => executedCodeBlocks.value.get(blockId), (newState) => {
        if (outputDiv) {
          outputDiv.innerHTML = '';
          if (newState) {
            if (newState.error) {
              const errorLine = document.createElement('div');
              errorLine.className = 'text-red-400';
              errorLine.textContent = `ERROR: ${newState.error}`;
              outputDiv.appendChild(errorLine);
            }
            newState.output.forEach(line => {
              const p = document.createElement('div');
              p.className = 'text-text-primary';
              p.textContent = line;
              outputDiv.appendChild(p);
            });
          }
          if (newState && (newState.output.length > 0 || newState.error)) {
            outputDiv.style.display = 'block';
          } else {
            outputDiv.style.display = 'none';
          }
        }
      }, { deep: true, immediate: true });
    }
  }
};

/**
 * Processes the incoming markdown HTML to find executable code blocks.
 * It transforms these blocks into containers with a "Run" button.
 * This function is debounced to prevent excessive re-processing during rapid markdown changes.
 */
const processMarkdownForExecution = useDebounceFn(() => {
  if (!root.value) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(props.markdownHtml, 'text/html');
  const codeBlocks = doc.querySelectorAll('pre[data-lang-execute]');

  codeBlocks.forEach(block => {
    const originalHtml = block.innerHTML;
    const lang = block.getAttribute('data-lang-execute');
    const blockId = block.getAttribute('data-code-block-id') || `code-block-${crypto.randomUUID()}`;

    const code = block.textContent || '';

    const newDiv = document.createElement('div');
    newDiv.innerHTML = originalHtml;
    newDiv.setAttribute('data-code-executor-id', blockId);
    newDiv.className = 'executable-code-block';

    const executeButton = document.createElement('button');
    executeButton.className = 'mt-2 px-3 py-1 bg-accent text-white rounded-md text-sm hover:bg-accent/90 transition-colors';
    executeButton.textContent = `Run ${lang === 'typescript' || lang === 'ts' ? 'TypeScript' : 'JavaScript'}`;
    executeButton.onclick = () => executeCodeBlock(code, lang!, blockId);
    newDiv.appendChild(executeButton);

    block.replaceWith(newDiv);
  });

  if (root.value) {
    root.value.innerHTML = doc.body.innerHTML;
  }
}, 100);

watch(() => props.markdownHtml, () => {
  executedCodeBlocks.value.clear();
  nextTick(() => {
    processMarkdownForExecution();
  });
}, { immediate: true });

onMounted(() => {
  processMarkdownForExecution();
});
</script>

<template>
  <article
    ref="root"
    class="prose-lg max-w-none prose"
    data-testid="rendered-markdown-article"
  />
</template>

<style scoped>
.executable-code-block {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--muted);
  margin-bottom: 1rem;
}

.executable-code-block pre {
  margin: 0;
}

.console-output {
  white-space: pre-wrap;
  word-break: break-all;
}

.console-output div {
  margin-bottom: 0.25rem;
}

.console-output div:last-child {
  margin-bottom: 0;
}
</style>