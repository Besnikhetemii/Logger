(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.slog = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const MAX_LENGTH = 100;
  const levelOrder = {
    none: 0,
    error: 1,
    info: 2,
    log: 3,
    all: 4,
  };

  let currentLevel = 'all';
  let enabled = true;
  let useTimestamps = false;
  let autoTruncate = true;
  const timeLabels = new Map();
  let structured = false;
  let uiEnabled = false;
  let uiContainer = null;
  let uiLogList = null;


  function truncate(message, maxLength = MAX_LENGTH) {
    if (typeof message !== 'string') {
      try {
        message = JSON.stringify(message, null, 2);
      } catch {
        message = String(message);
      }
    }
    return autoTruncate && message.length > maxLength ? message.slice(0, maxLength) + '…' : message;
  }

  function getType(val) {
    if (Array.isArray(val)) return 'ARRAY';
    if (val === null) return 'NULL';
    return typeof val === 'object' ? 'OBJECT' : typeof val;
  }

  function formatMessage(level, args) {
    const tagColor = {
      log: '#61dafb',
      error: '#ff6b6b',
      info: '#4ecdc4',
      time: '#f39c12',
    };

    let tag = '';
    if (typeof args[0] === 'string' && !args[0].startsWith('[')) {
      tag = args.shift().toUpperCase();
    }

    const timestamp = useTimestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    const prefix = `[${level.toUpperCase()}]${tag ? ' [' + tag + ']' : ''}`;

    const messages = args.map(arg => {
      const type = `[${getType(arg).toUpperCase()}]`;
      const content = typeof arg === 'object' ? JSON.stringify(arg) : truncate(arg);

      return `${type} ${content}`;
    });

    const style1 = `color: ${tagColor[level] || '#aaa'}; font-weight: bold;`;
    const style2 = 'color: #ddd;';

    return [`%c${timestamp}${prefix}%c ${messages.join(' ')}`, style1, style2];
  }

  function shouldLog(level) {
    return enabled && levelOrder[level] <= levelOrder[currentLevel];
  }

function log(...args) {
  if (!shouldLog('log')) return;

  let output;

  if (structured) {
    let tag = '';
    if (typeof args[0] === 'string' && !args[0].startsWith('[')) {
      tag = args.shift().toUpperCase();
    }
    const logObj = buildStructuredLog('log', args, tag);
    output = `[${logObj.timestamp}] [${logObj.level.toUpperCase()}]${tag ? ' [' + tag + ']' : ''} ${logObj.message}`;
    console.log('%c[STRUCTURED]', 'color: #6a0dad; font-weight: bold;', logObj);
  } else {
    const formatted = formatMessage('log', args);
    output = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    console.log(...formatted);
  }

  appendToUI('log', [output]);
}




  function buildStructuredLog(level, args, tag = '') {
    const timestamp = new Date().toISOString();
    const messageParts = args.map(arg => {
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    });
    return {
      level,
      timestamp,
      tag,
      message: messageParts.join(' '),
    };
  }

  function slogUIOn() {
    if (uiEnabled) return;
    uiEnabled = true;

    uiContainer = document.createElement('div');
    uiContainer.id = 'slog-ui';
    uiContainer.innerHTML = `
      <div id="slog-toggle">🪵 Logs</div>
      <div id="slog-panel">
        <div id="slog-header">
          <span>sLog Console</span>
          <div id="slog-controls">
            <button id="slog-clear">Clear</button>
            <button id="slog-export">Export</button>
          </div>
        </div>
        <div id="slog-list"></div>
      </div>
    `;

    document.body.appendChild(uiContainer);

    const style = document.createElement('style');
    style.textContent = `
      #slog-ui {
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-family: monospace;
        z-index: 9999;
      }
      #slog-ui #slog-toggle {
        background: #444;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      #slog-ui #slog-panel {
        display: none;
        flex-direction: column;
        width: 350px;
        max-height: 400px;
        margin-top: 10px;
        background: #111;
        color: #eee;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0,0,0,0.4);
      }
      #slog-ui #slog-header {
        display: flex;
        justify-content: space-between;
        padding: 6px 10px;
        background: #222;
        font-weight: bold;
        border-bottom: 1px solid #444;
      }
      #slog-ui #slog-list {
        overflow-y: auto;
        max-height: 360px;
        padding: 8px;
        font-size: 12px;
      }
      #slog-ui #slog-list .slog-entry {
        border-bottom: 1px solid #333;
        padding: 4px 0;
      }
      #slog-ui #slog-list .error { color: #ff6b6b; }
      #slog-ui #slog-list .info { color: #4ecdc4; }
      #slog-ui #slog-list .log { color: #61dafb; }
      #slog-ui .slog-entry {
        position: relative;
        padding: 8px 40px 8px 12px; 
        margin-bottom: 6px;
        border-radius: 6px;
        background-color: #1a1a1a;
        box-shadow: 0 1px 4px rgba(0,0,0,0.5);
        font-family: monospace;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
      }

      #slog-ui .slog-entry .toggle-details {
        top: 8px;
        right: 12px;
        cursor: pointer;
        font-size: 12px;
        color: #61dafb;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 4px;
          flex-shrink: 0;
        user-select: none;
      }

      #slog-ui .slog-entry .toggle-details:hover {
        color: #4ecdc4;
      }

      #slog-ui .slog-entry .toggle-details .arrow {
        display: inline-block;
        transition: transform 0.25s ease;
        font-weight: bold;
      }

      #slog-ui .slog-entry.expanded .toggle-details .arrow {
        transform: rotate(90deg);
      }

      #slog-ui .slog-entry .details-content {
        margin-top: 8px;
        padding: 8px;
        background-color: #222;
        border-radius: 4px;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: monospace;
        box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
      }

      #slog-ui .slog-main-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      #slog-ui .preview-text {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #slog-ui #slog-controls {
        display: flex;
        gap: 8px;
      }

      #slog-ui #slog-controls button {
        background: #444;
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background-color 0.2s ease;
      }

      #slog-ui #slog-controls button:hover {
        background: #61dafb;
        color: #111;
      }


    `;
    document.head.appendChild(style);

    uiLogList = uiContainer.querySelector('#slog-list');

    uiContainer.querySelector('#slog-toggle').onclick = () => {
      const panel = uiContainer.querySelector('#slog-panel');
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    };
    uiContainer.querySelector('#slog-clear').onclick = () => {
      uiLogList.innerHTML = '';
    };

    uiContainer.querySelector('#slog-export').onclick = () => {
  if (!uiLogList) return;

  let logsText = '';

  uiLogList.querySelectorAll('.slog-entry').forEach(entry => {
    const details = entry.querySelector('.details-content');
    if (details) {
      // Export full details content (prettified JSON or full text)
      logsText += details.textContent + '\n\n';
    } else {
      // No details-content, export the whole entry text
      logsText += entry.textContent + '\n\n';
    }
  });

  const blob = new Blob([logsText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `slog-export-${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

  }


    function error(...args) {
      if (!shouldLog('log')) return;
      appendToUI('error', args);
    }

 function info(...args) {
      if (!shouldLog('log')) return;
      appendToUI('info', args);
    }


  function log(...args) {
    if (!shouldLog('log')) return;
    appendToUI('log', args);
  }

  function setLevel(level) {
    if (levelOrder[level] !== undefined) currentLevel = level;
  }

  function setDefaultLevel() {
    currentLevel = 'all';
  }

  function disable() {
    enabled = false;
  }

  function enable() {
    enabled = true;
  }

  function timeStart(id, label) {
    const name = (label || id).toUpperCase();
    timeLabels.set(id, new Date());
    if (shouldLog('log')) {
      console.log(...formatMessage('time', [name, `Started at: ${new Date().toLocaleTimeString()}`]));
    }
  }

  function timeEnd(id, label) {
    const name = (label || id).toUpperCase();
    const start = timeLabels.get(id);
    const end = new Date();
    if (!start) {
      if (shouldLog('error')) {
        console.error(...formatMessage('error', [name, 'No start time found for this label. Did you call timeStart()?']));
      }
      return;
    }
    const diff = ((end - start) / 1000).toFixed(2);
    if (shouldLog('log')) {
      console.log(...formatMessage('time', [name, `Ended at: ${end.toLocaleTimeString()} (+${diff}s)`]));
    }
    timeLabels.delete(id);
  }

  function clear() {
    try {
      console.clear();
      console.info('%csLog UI cleared. Note: If you see "console.clear() was prevented due to Preserve log" warning, clearing console was blocked by browser settings.', 'color: #4ecdc4; font-weight: bold;');
    } catch (e) {
      console.error('sLog clear failed:', e);
    }
    if (uiEnabled && uiLogList) {
      uiLogList.innerHTML = '';
    }
  }

  function reset() {
    currentLevel = 'all';
    enabled = true;
    useTimestamps = false;
    autoTruncate = true;
    structured = false;
  }

function appendToUI(level, args) {
  if (!uiEnabled || !uiLogList) return;

  // Compose message and check if it's an object or long string
  let message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  if (!message.trim()) return;

  const entry = document.createElement('div');
  entry.className = 'slog-entry ' + level;

  // Check if any arg is object (pretty JSON) to show toggle
  const hasObject = args.some(a => typeof a === 'object');

  if (hasObject) {
  // Create a flex container for preview + toggle
  const mainRow = document.createElement('div');
  mainRow.className = 'slog-main-row';

  // Create preview text
  const previewText = document.createElement('div');
  previewText.className = 'preview-text';
  previewText.textContent = message.split('\n')[0].slice(0, 100) + (message.length > 100 ? '…' : '');

  // Create toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.className = 'toggle-details';
  toggleBtn.innerHTML = `<span class="arrow">▶</span> Show Details`;

  toggleBtn.onclick = () => {
    const isExpanded = entry.classList.toggle('expanded');
    details.style.display = isExpanded ? 'block' : 'none';
    toggleBtn.querySelector('.arrow').textContent = isExpanded ? '▼' : '▶';
    toggleBtn.childNodes[1].nodeValue = isExpanded ? ' Hide Details' : ' Show Details';
  };

  // Append preview and toggle to flex container
  mainRow.appendChild(previewText);
  mainRow.appendChild(toggleBtn);

  // Create details container
  const details = document.createElement('pre');
  details.className = 'details-content';
  details.textContent = message;
  details.style.display = 'none';

  // Append flex container and details container separately
  entry.appendChild(mainRow);
  entry.appendChild(details);
} else {
  entry.textContent = message;
}


  uiLogList.appendChild(entry);
  uiLogList.scrollTop = uiLogList.scrollHeight;
}


  function setTimestamps(value) {
    useTimestamps = !!value;
  }

  function setAutoTruncingOn() {
    autoTruncate = true;
  }

  function setAutoTruncingOff() {
    autoTruncate = false;
  }

  function group(label) {
    console.groupCollapsed(`[GROUP] ${label}`);
  }

  function groupEnd() {
    console.groupEnd();
  }

  function setGroupCollapsedByDefault(value) {
    groupCollapsedByDefault = !!value;
  }

  function setStructured(value) {
    structured = !!value;
  }

  return {
    log,
    error,
    info,
    setLevel,
    setDefaultLevel,
    enable,
    disable,
    setTimestamps,
    setAutoTruncingOn,
    setAutoTruncingOff,
    group,
    groupEnd,
    timeStart,
    timeEnd,
    setStructured,
    clear,
    reset,
    slogUIOn,
  };
}));
