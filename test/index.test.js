const { smartDebounce } = require("../src");

jest.useFakeTimers();

describe("smartDebounce", () => {
    it("should debounce adaptively", async () => {
    const fn = jest.fn();
    const debounced = smartDebounce(fn, { mode: "adaptive", min: 100, max: 500 });

    debounced("a");
    debounced("b");

    // Advance time enough to trigger debounce
    jest.advanceTimersByTime(600);

    // Allow pending promises to resolve
    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
    });

  it("should support cancel", () => {
    const fn = jest.fn();
    const debounced = smartDebounce(fn, { delay: 300, mode: "debounce" });

    debounced("x");
    debounced.cancel();

    jest.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  it("should support flush", () => {
    const fn = jest.fn();
    const debounced = smartDebounce(fn, { delay: 300, mode: "debounce" });

    debounced("y");
    debounced.flush();

    expect(fn).toHaveBeenCalledWith("y");
  });

  it("should support priority", () => {
    const fn = jest.fn();
    const debounced = smartDebounce(fn, { delay: 300, mode: "debounce" });

    debounced("z");
    debounced.priority("urgent");

    expect(fn).toHaveBeenCalledWith("urgent");
  });

  it("should return a promise for async functions", async () => {
    const fn = jest.fn((x) => Promise.resolve(x * 2));
    const debounced = smartDebounce(fn, { delay: 100, mode: "debounce" });

    const result = debounced(5);
    jest.advanceTimersByTime(150);

    await expect(result).resolves.toBe(10);
  });
});
