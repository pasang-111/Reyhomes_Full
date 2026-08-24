/** Helpers so server pages can surface API failures instead of silent empty lists. */

export type SafeResult<T> = { data: T; error: string | null };

export async function safeList<T>(
  fn: () => Promise<T[]>,
  empty: T[] = []
): Promise<SafeResult<T[]>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Could not load data. Please try again.";
    return { data: empty, error: message };
  }
}
