/** AI daily limits disabled — always allow (no usage rows inserted). */
export async function checkAILimit(
  _userId: string,
  _toolSlug: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  return { allowed: true, used: 0, limit: Infinity }
}
