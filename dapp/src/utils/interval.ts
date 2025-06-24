export function interval(handler: () => void, timeout?: number) {
  if (!timeout || timeout <= 0) return;

  const interval = setInterval(handler, timeout);
  return () => clearInterval(interval);
}
