export const vueTrackerUpdate = async (env) => {
  const { url, updated_at } = await env.VueTracker.prepare("SELECT url, updated_at FROM sites ORDER BY updated_at ASC LIMIT 1").first();
  const today = Date.now();
  const diff = today - updated_at;
  if (diff < 1 * 24 * 60 * 60 * 1000) {
    console.info(`${url} is up to date`);
    return;
  }
  console.info(`${url} is outdated, updating...`);
  await $fetch("https://vuetracker.pages.dev/api/lookup", { query: { url } });
};