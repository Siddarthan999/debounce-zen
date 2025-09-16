export type SmartDebounceOptions = {
  mode?: "adaptive" | "debounce" | "throttle";
  min?: number;
  max?: number;
  delay?: number;
  interval?: number;
  leading?: boolean;
  trailing?: boolean;
  onExecute?: (args: any[]) => void;
  onCancel?: () => void;
  onFlush?: () => void;
};

export interface SmartDebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => void;
  priority: (...args: Parameters<T>) => void;
}

export function smartDebounce<T extends (...args: any[]) => any>(
  fn: T,
  options?: SmartDebounceOptions
): SmartDebouncedFunction<T>;
