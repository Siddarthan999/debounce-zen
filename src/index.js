/**
 * smartDebounce - adaptive debounce/throttle utility
 *
 * @param {Function} fn - function to wrap
 * @param {Object} options
 *   mode: "adaptive" | "debounce" | "throttle" (default: "adaptive")
 *   min: number (min delay for adaptive)
 *   max: number (max delay for adaptive)
 *   delay: number (fixed debounce delay)
 *   interval: number (fixed throttle interval)
 *   leading: boolean (fire on first call)
 *   trailing: boolean (fire on last call)
 *   onExecute: (args) => void
 *   onCancel: () => void
 *   onFlush: () => void
 * @returns {Function} wrapped function with { cancel, flush, priority }
 */

function smartDebounce(fn, options = {}) {
  const {
    mode = "adaptive",
    min = 200,
    max = 1500,
    delay = 300,
    interval = 300,
    leading = false,
    trailing = true,
    onExecute,
    onCancel,
    onFlush
  } = options;

  let timer = null;
  let lastCall = 0;
  let lastArgs;
  let lastThis;
  let pendingPromiseResolve;

  function execute() {
    if (!lastArgs) return;

    const result = fn.apply(lastThis, lastArgs);
    if (onExecute) onExecute(lastArgs);

    if (pendingPromiseResolve) {
      pendingPromiseResolve(result);
      pendingPromiseResolve = null;
    }

    lastArgs = lastThis = null;
  }

  function wrapped(...args) {
    lastArgs = args;
    lastThis = this;

    // Promise support
    return new Promise((resolve) => {
      pendingPromiseResolve = resolve;

      const now = Date.now();

      let wait;
      if (mode === "debounce") {
        wait = delay;
      } else if (mode === "throttle") {
        if (now - lastCall >= interval) {
          lastCall = now;
          if (leading) execute();
        }
        wait = interval;
      } else {
        // adaptive
        const diff = now - lastCall;
        if (diff < min) wait = min;
        else if (diff > max) wait = max;
        else wait = diff;
      }

      clearTimeout(timer);
      timer = setTimeout(() => {
        if (trailing) execute();
        lastCall = Date.now();
      }, wait);
    });
  }

  wrapped.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      if (onCancel) onCancel();
    }
    lastArgs = lastThis = null;
  };

  wrapped.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      execute();
      if (onFlush) onFlush();
    }
  };

  wrapped.priority = (...args) => {
    wrapped.cancel();
    lastArgs = args;
    lastThis = this;
    execute();
  };

  return wrapped;
}

// Support CommonJS (Node) and ESM (browser) for JEST testing
// if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
//   module.exports = { smartDebounce };  // Node/CommonJS
// }

export { smartDebounce };