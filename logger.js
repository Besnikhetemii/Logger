(function(global) {
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

  // Helper to detect type string
  function getType(value) {
    if (value === null) return 'NULL';
    if (Array.isArray(value)) return 'ARRAY';
    return typeof value === 'object' ? 'OBJECT' : typeof value === 'string' ? 'STRING' : typeof value;
  }

  function truncate(message, maxLength = MAX_LENGTH) {
    if (typeof message !== 'string') {
      try {
        message = JSON.stringify(message, null, 2); // pretty print with indent
      } catch {
        message = String(message);
      }
    }
    return autoTruncate && message.length > maxLength ? message.slice(0, maxLength) + '…' : message;
  }

  function formatMessage(level, args) {
    const tagColor = {
      log: '#61dafb',
      error: '#ff6b6b',
      info: '#4ecdc4'
    };

    let customTag = '';
    let messageArgs = args;

    // Check if first argument is custom tag (all caps, digits, underscore)
    if (args.length > 1 && typeof args[0] === 'string' && /^[A-Z0-9_]+$/.test(args[0])) {
      customTag = `[${args[0]}] `;
      messageArgs = Array.from(args).slice(1);
    }

    // Detect type of first message argument for display
    const typeTag = messageArgs.length > 0 ? `[${getType(messageArgs[0]).toUpperCase()}] ` : '';

    const prefix = `[${level.toUpperCase()}] ${typeTag}${customTag}`;
    const timestamp = useTimestamps ? `[${new Date().toLocaleTimeString()}] ` : '';
    const style1 = `color: ${tagColor[level] || '#aaa'}; font-weight: bold;`;
    const style2 = 'color: #ddd;';

    // Map all args to truncated strings (pretty printed for objects/arrays)
    const formattedArgs = messageArgs.map(arg => truncate(arg));
    const joined = formattedArgs.join(' ');

    return [`%c${timestamp}${prefix}%c ${joined}`, style1, style2];
  }

  function shouldLog(level) {
    return enabled && levelOrder[level] <= levelOrder[currentLevel];
  }

  function log(...args) {
    if (shouldLog('log')) {
      console.log(...formatMessage('log', args));
    }
  }

  function error(...args) {
    if (shouldLog('error')) {
      console.error(...formatMessage('error', args));
    }
  }

  function info(...args) {
    if (shouldLog('info')) {
      console.info(...formatMessage('info', args));
    }
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

  function setTimestamps(value) {
    useTimestamps = !!value;
  }

  function setAutoTruncingOn() {
    autoTruncate = true;
  }

  function setAutoTruncingOff() {
    autoTruncate = false;
  }

  function group(...args) {
    if (!enabled) return;
    console.group(...args);
  }

  function groupEnd() {
    if (!enabled) return;
    console.groupEnd();
  }

  global.slog = {
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
  };
})(window);
