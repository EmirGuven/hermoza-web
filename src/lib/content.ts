import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { collections, journalPosts, settings } from "@/db/schema";
import {
  SETTING_DEFAULTS,
  defaultCollections,
  defaultJournal,
  type Collection,
  type JournalPost,
  type SettingKey,
  type SettingValue,
} from "@/lib/content-types";

/** Panelde kayıt yapılınca updateTag(SITE_TAG) ile tüm site önbelleği yenilenir. */
export const SITE_TAG = "site";

/** Kayıtlı değeri varsayılanla birleştirir: yeni eklenen alanlar eski kayıtlarda da dolu gelir. */
function merge<T>(base: T, value: unknown): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] =
      b && typeof b === "object" && !Array.isArray(b) && v && typeof v === "object" && !Array.isArray(v)
        ? merge(b, v)
        : v;
  }
  return out as T;
}

/** Ayar okur; önbellekte tutulur, panelde kayıt yapılınca yenilenir. */
export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  "use cache";
  cacheTag(SITE_TAG);
  return readSetting(key);
}

/** Önbelleksiz okuma (panel formları için) */
export async function readSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const base = SETTING_DEFAULTS[key] as SettingValue<K>;
  try {
    const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
    return merge(base, row?.value);
  } catch (e) {
    console.error(`[content] ayar okunamadı (${key}):`, (e as Error).message);
    return base;
  }
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(SITE_TAG);
  try {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.active, true))
      .orderBy(asc(collections.sort), asc(collections.id));
  } catch (e) {
    console.error("[content] koleksiyonlar okunamadı:", (e as Error).message);
    return defaultCollections.map((c, i) => ({ ...c, id: -(i + 1) }));
  }
}

export async function getJournal(): Promise<JournalPost[]> {
  "use cache";
  cacheTag(SITE_TAG);
  try {
    return await db
      .select()
      .from(journalPosts)
      .where(eq(journalPosts.active, true))
      .orderBy(asc(journalPosts.sort), asc(journalPosts.id));
  } catch (e) {
    console.error("[content] journal okunamadı:", (e as Error).message);
    return defaultJournal.map((j, i) => ({ ...j, id: -(i + 1) }));
  }
}
