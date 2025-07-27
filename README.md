# logger

> ☕ Logging in JavaScript is easy but with `logger`, it's like logging with espresso shots.  
> No more `console.log()` spam. Just `slog.log()`, `slog.error()`, and chill.

**logger** is a lightweight, vanilla JavaScript logging plugin that makes console logging cleaner and easier. It provides short method names (`slog.log`, `slog.error`, `slog.info`), automatic message truncation, log level control, pretty printing for objects/arrays, custom tags, grouping support, and color-coded output all optimized for dark mode themes.

---

## 🌟 Features

- ✅ Short logging methods: `log`, `error`, `info`
- ✂️ Auto-truncates long messages (default: 100 characters) with toggle on/off
- 🎨 Color-coded console output (dark mode–friendly)
- 🕒 Optional timestamps
- 🔇 Enable/disable logging at runtime
- 🎚 Log level filtering: `none`, `error`, `info`, `log`, `all`
- 🏷️ Custom tags/prefixes support (e.g. `[LOG] [DB] message`)
- 🔍 Pretty printing for objects and arrays with `[TYPE]` label
- 🗂 Grouping support (`group`, `groupEnd`)
- 🧩 No dependencies works in any browser with vanilla JS

---

## 🚀 Getting Started

### 1. Add `logger.js` to your project

Download or copy the [`logger.js`](./logger.js) file into your project folder.

### 2. API Reference

| Method                      | Description                                              |
|-----------------------------|----------------------------------------------------------|
| `slog.log(...args)`         | Logs a general message                                   |
| `slog.error(...args)`       | Logs an error message                                    |
| `slog.info(...args)`        | Logs an informational message                            |
| `slog.setLevel(level)`      | Sets log level (`none`, `error`, `info`, `log`, `all`)  |
| `slog.setDefaultLevel()`    | Resets log level to show all                             |
| `slog.enable()`             | Enables logging                                         |
| `slog.disable()`            | Disables logging                                        |
| `slog.setTimestamps(bool)`  | Enables/disables timestamps in logs                      |
| `slog.setAutoTruncingOn()`  | Enables auto truncation of long messages                  |
| `slog.setAutoTruncingOff()` | Disables auto truncation                                  |
| `slog.group(label)`         | Starts a console group with the given label             |
| `slog.groupEnd()`           | Ends the current console group                           |

### 3. Include it in your HTML

```html
<script src="logger.js"></script>
<script>
  slog.log('This is a regular log message.'); // [LOG] [STRING] This is a regular log message.
  slog.error('Oops! Something went wrong.'); // [ERROR] [STRING] Oops! Something went wrong.
  slog.info('FYI: Everything is working fine.'); // [INFO] [STRING] FYI: Everything is working fine.

  // Long message truncated (default 100 chars)
  slog.log('LONG', 'This is a really long message that should be truncated after 100 characters to keep things neat in the console...');

  // Disable auto truncation
  slog.setAutoTruncingOff();
  slog.log('LONG', 'This long message will NOT be truncated even if it is very long and verbose...');

  // Pretty print object with custom tag
  slog.info('USER', { id: 123, name: 'Alice', roles: ['admin', 'editor'] });

  // Pretty print array
  slog.log('DATA', [1, 2, 3, 4, 5]);

  // Enable timestamps
  slog.setTimestamps(true);
  slog.log('Now with a timestamp!');

  // Log level control
  slog.setLevel('error'); // Only errors will show
  slog.log('This log will NOT show');
  slog.error('This error will show');

  slog.setDefaultLevel(); // Reset to show all logs

  // Enable/disable logging
  slog.disable();
  slog.log('This will NOT show');
  slog.enable();
  slog.log('Logging enabled again');

  // Grouping logs
  slog.group('User Actions');
  slog.log('Clicked button');
  slog.error('Button action failed');
  slog.groupEnd();
</script>
