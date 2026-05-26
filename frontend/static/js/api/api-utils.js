export async function safeFetch(fetcher, fallback, label) {
  try {
    return await fetcher();
  } catch (error) {
    console.error(`無法載入${label}:`, error);
    return fallback;
  }
}
