export function showFieldError(
  error: string | undefined,
  touched: boolean | undefined,
  submitCount: number,
) {
  return Boolean(error && (touched || submitCount > 0));
}
