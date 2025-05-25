import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

export const vueTrackerUpdate = async (env) => {
  const { slug, input_url, updated_at } = await env.VueTracker.prepare("SELECT slug, input_url, updated_at FROM sites ORDER BY updated_at ASC LIMIT 1").first();
  const today = Date.now();
  const diff = today - updated_at;
  if (diff < 1 * 24 * 60 * 60 * 1000) {
    console.info(`${input_url} is up to date`);
    return;
  }
  console.info(`${input_url} is outdated, updating...`);
  const data = await $fetch("https://vuetracker.pages.dev/api/lookup", {
    query: { url: input_url },
    ...defaultRetry
  }).catch(() => null);
  if (!data) {
    await env.VueTracker.prepare("UPDATE sites SET updated_at = ? WHERE slug = ?").bind(today, slug).run();
  }
  return data;
};