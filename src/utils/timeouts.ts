export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

export async function withFallback<T>(
  task: () => Promise<T>,
  fallback: T,
  label: string,
  timeoutMs = 10_000
): Promise<T> {
  try {
    return await withTimeout(task(), timeoutMs, label);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[fallback] ${label}: ${reason}`);
    return fallback;
  }
}
