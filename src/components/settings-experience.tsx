"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { ProfilePhotoManager } from "@/components/profile-photo-manager";
import {
  getSearchPrefs,
  notifySearchPrefs,
  setSearchPrefs,
  type SearchPrefs,
} from "@/lib/search-prefs";
import {
  clearRecentSearches,
  getRecentSearches,
} from "@/lib/recent-searches";
import { cn } from "@/lib/utils";

const PRIVACY_KEY = "devhub:privacy";

interface PrivacyPrefs {
  saveRecentViews: boolean;
}

function getPrivacyPrefs(): PrivacyPrefs {
  if (typeof window === "undefined") return { saveRecentViews: true };
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (!raw) return { saveRecentViews: true };
    const parsed = JSON.parse(raw) as Partial<PrivacyPrefs>;
    return {
      saveRecentViews:
        typeof parsed.saveRecentViews === "boolean" ? parsed.saveRecentViews : true,
    };
  } catch {
    return { saveRecentViews: true };
  }
}

const NOTIF_KEY = "devhub:notif-prefs";

interface NotifPrefs {
  productUpdates: boolean;
  researchReminders: boolean;
  savedItemUpdates: boolean;
}

function getNotifPrefs(): NotifPrefs {
  const fallback = { productUpdates: false, researchReminders: false, savedItemUpdates: false };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(NOTIF_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
    return {
      productUpdates: parsed.productUpdates === true,
      researchReminders: parsed.researchReminders === true,
      savedItemUpdates: parsed.savedItemUpdates === true,
    };
  } catch {
    return fallback;
  }
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors duration-200",
        checked
          ? "border-brand1/50 bg-brand1"
          : "border-line bg-surface-3",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

function OptionRow({
  title,
  detail,
  control,
}: {
  title: string;
  detail?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {detail && <p className="mt-0.5 text-xs leading-5 text-ink3">{detail}</p>}
      </div>
      <div className="flex-none">{control}</div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="py-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
              value === opt.value
                ? "border-brand1/50 bg-brand1/5 text-brand1"
                : "border-line text-ink2 hover:border-line2 hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsExperience({
  displayName,
  email,
  githubUsername,
  avatarUrl,
  providerAvatarUrl,
  savedDevelopers,
  savedRepositories,
  recentViews,
}: {
  displayName: string;
  email: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  providerAvatarUrl: string | null;
  savedDevelopers: number;
  savedRepositories: number;
  recentViews: number;
}) {
  const [avatar, setAvatar] = useState<string | null>(avatarUrl);
  const [prefs, setPrefs] = useState<SearchPrefs | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({ saveRecentViews: true });
  const [notif, setNotif] = useState<NotifPrefs>({
    productUpdates: false,
    researchReminders: false,
    savedItemUpdates: false,
  });
  const [recentCount, setRecentCount] = useState(0);
  const [clearing, setClearing] = useState<"views" | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(getSearchPrefs());
    setPrivacy(getPrivacyPrefs());
    setNotif(getNotifPrefs());
    setRecentCount(getRecentSearches().length);
    function sync() {
      setPrefs(getSearchPrefs());
      setRecentCount(getRecentSearches().length);
    }
    window.addEventListener("devhub:search-prefs", sync);
    window.addEventListener("devhub:recent-searches", sync);
    return () => {
      window.removeEventListener("devhub:search-prefs", sync);
      window.removeEventListener("devhub:recent-searches", sync);
    };
  }, []);

  function updatePrefs(patch: Partial<SearchPrefs>) {
    const next = setSearchPrefs(patch);
    setPrefs(next);
    notifySearchPrefs();
  }

  function updatePrivacy(patch: Partial<PrivacyPrefs>) {
    const next = { ...privacy, ...patch };
    setPrivacy(next);
    try {
      window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
    } catch {
      // Best effort.
    }
  }

  function updateNotif(patch: Partial<NotifPrefs>) {
    const next = { ...notif, ...patch };
    setNotif(next);
    try {
      window.localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    } catch {
      // Best effort.
    }
  }

  async function clearViews() {
    if (!window.confirm("Clear all recent views? This cannot be undone.")) return;
    setClearing("views");
    setNotice("");
    try {
      const res = await fetch("/api/recent-views", { method: "DELETE" });
      if (!res.ok) throw new Error("Clear failed");
      setNotice("Recent views cleared.");
    } catch {
      setNotice("Could not clear recent views. Try again.");
    } finally {
      setClearing(null);
    }
  }

  function clearHistory() {
    if (!window.confirm("Clear recent search history on this device?")) return;
    clearRecentSearches();
    setRecentCount(0);
    setNotice("Recent search history cleared on this device.");
  }

  return (
    <div className="space-y-10">
      {notice && (
        <p role="status" className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink2">
          {notice}
        </p>
      )}

      <section aria-labelledby="settings-profile">
        <SectionTitle title="Profile" eyebrow="Account" />
        <Card>
          <ProfilePhotoManager
            displayName={displayName}
            currentUrl={avatar}
            providerUrl={providerAvatarUrl}
            onChanged={setAvatar}
          />
          <dl className="mt-5 divide-y divide-line border-t border-line">
            <div className="flex items-center gap-4 py-3">
              <dt className="w-32 flex-none text-xs text-ink3">Display name</dt>
              <dd className="min-w-0 truncate text-sm font-medium text-ink">{displayName}</dd>
            </div>
            <div className="flex items-center gap-4 py-3">
              <dt className="w-32 flex-none text-xs text-ink3">Email</dt>
              <dd className="min-w-0 truncate text-sm font-medium text-ink">{email}</dd>
            </div>
            {githubUsername && (
              <div className="flex items-center gap-4 py-3">
                <dt className="w-32 flex-none text-xs text-ink3">GitHub username</dt>
                <dd className="min-w-0 truncate text-sm font-medium text-ink">@{githubUsername}</dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-xs leading-5 text-ink3">
            Name, email and GitHub username are managed by your sign-in provider and shown here read-only.
          </p>
        </Card>
      </section>

      <section aria-labelledby="settings-preferences">
        <SectionTitle title="Preferences" eyebrow="Defaults" />
        <Card>
          {prefs ? (
            <div className="divide-y divide-line">
              <Segmented
                label="Default landing after login"
                value={prefs.defaultLanding}
                onChange={(v) => updatePrefs({ defaultLanding: v })}
                options={[
                  { value: "/dashboard", label: "Dashboard" },
                  { value: "/search", label: "Explore" },
                  { value: "/favourites", label: "Saved" },
                ]}
              />
              <Segmented
                label="Default search type"
                value={prefs.defaultSearchType}
                onChange={(v) => updatePrefs({ defaultSearchType: v })}
                options={[
                  { value: "all", label: "All" },
                  { value: "developers", label: "Developers" },
                  { value: "repositories", label: "Repositories" },
                ]}
              />
              <Segmented
                label="Results per page"
                value={String(prefs.resultsPerPage) as "10" | "20" | "30"}
                onChange={(v) => updatePrefs({ resultsPerPage: Number(v) as 10 | 20 | 30 })}
                options={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "30", label: "30" },
                ]}
              />
            </div>
          ) : (
            <div className="skeleton h-24" />
          )}
          <p className="mt-3 text-xs leading-5 text-ink3">
            Stored on this device. Results per page applies to search result pages.
          </p>
        </Card>
      </section>

      <section aria-labelledby="settings-search">
        <SectionTitle title="Search & discovery" eyebrow="Discovery" />
        <Card>
          {prefs ? (
            <div className="divide-y divide-line">
              <OptionRow
                title="Search suggestions"
                detail="Show autocomplete while typing in global and compare search."
                control={
                  <Toggle
                    checked={prefs.suggestionsEnabled}
                    onChange={(v) => updatePrefs({ suggestionsEnabled: v })}
                    label="Search suggestions"
                  />
                }
              />
              <OptionRow
                title="Recent search history"
                detail="Remember recent searches on this device."
                control={
                  <Toggle
                    checked={prefs.recentHistoryEnabled}
                    onChange={(v) => updatePrefs({ recentHistoryEnabled: v })}
                    label="Recent search history"
                  />
                }
              />
              <OptionRow
                title="Include developers in global search"
                control={
                  <Toggle
                    checked={prefs.includeDevelopers}
                    onChange={(v) => updatePrefs({ includeDevelopers: v })}
                    label="Include developers in global search"
                  />
                }
              />
              <OptionRow
                title="Include repositories in global search"
                control={
                  <Toggle
                    checked={prefs.includeRepositories}
                    onChange={(v) => updatePrefs({ includeRepositories: v })}
                    label="Include repositories in global search"
                  />
                }
              />
              <OptionRow
                title="Open results in new tab"
                detail="Off opens results in the same tab."
                control={
                  <Toggle
                    checked={prefs.openInNewTab}
                    onChange={(v) => updatePrefs({ openInNewTab: v })}
                    label="Open results in new tab"
                  />
                }
              />
            </div>
          ) : (
            <div className="skeleton h-24" />
          )}
        </Card>
      </section>

      <section aria-labelledby="settings-notifications">
        <SectionTitle title="Notifications" eyebrow="Updates" />
        <Card>
          <div className="divide-y divide-line">
            {(
              [
                ["productUpdates", "Product updates", "Occasional notes about new DevHub capabilities."],
                ["researchReminders", "Research reminders", "Gentle nudges to revisit saved signals."],
                ["savedItemUpdates", "Saved-item updates", "Heads-up when saved developers or repositories move."],
              ] as const
            ).map(([key, title, detail]) => (
              <OptionRow
                key={key}
                title={title}
                detail={detail}
                control={
                  <span className="flex items-center gap-2">
                    <span className="rounded-full border border-line bg-panel px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink3">
                      Coming soon
                    </span>
                    <Toggle
                      checked={notif[key]}
                      onChange={(v) => updateNotif({ [key]: v })}
                      label={title}
                    />
                  </span>
                }
              />
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-ink3">
            DevHub does not deliver notifications yet. Choices above are saved on this device
            only and will light up when delivery ships — nothing is sent anywhere today.
          </p>
        </Card>
      </section>

      <section aria-labelledby="settings-privacy">
        <SectionTitle title="Privacy" eyebrow="Data use" />
        <Card>
          <div className="divide-y divide-line">
            <OptionRow
              title="Save recent views"
              detail="Record developers and repositories you open in your private workspace."
              control={
                <Toggle
                  checked={privacy.saveRecentViews}
                  onChange={(v) => updatePrivacy({ saveRecentViews: v })}
                  label="Save recent views"
                />
              }
            />
            <OptionRow
              title="Save search history"
              detail="Remember recent searches on this device."
              control={
                <Toggle
                  checked={prefs?.recentHistoryEnabled ?? true}
                  onChange={(v) => updatePrefs({ recentHistoryEnabled: v })}
                  label="Save search history"
                />
              }
            />
          </div>
          <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={clearHistory}
              className="btn btn-secondary btn-sm w-full"
            >
              Clear recent search history{recentCount > 0 ? ` (${recentCount})` : ""}
            </button>
            <button
              type="button"
              onClick={clearViews}
              disabled={clearing === "views"}
              className="btn btn-secondary btn-sm w-full"
            >
              {clearing === "views" ? "Clearing…" : "Clear recent views"}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink3">
            Clearing asks for confirmation first and only touches the data named above.
          </p>
        </Card>
      </section>

      <section aria-labelledby="settings-data">
        <SectionTitle title="Data" eyebrow="Workspace" />
        <Card>
          <dl className="divide-y divide-line">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-ink3">Saved developers</dt>
              <dd className="text-sm font-semibold text-ink">{savedDevelopers}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-ink3">Saved repositories</dt>
              <dd className="text-sm font-semibold text-ink">{savedRepositories}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-ink3">Recent views</dt>
              <dd className="text-sm font-semibold text-ink">{recentViews}</dd>
            </div>
          </dl>
          <div className="mt-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={clearViews}
              disabled={clearing === "views"}
              className="btn btn-secondary btn-sm w-full sm:w-auto"
            >
              {clearing === "views" ? "Clearing…" : "Clear recent history"}
            </button>
          </div>
        </Card>
      </section>

      <section aria-labelledby="settings-appearance">
        <SectionTitle title="Appearance" eyebrow="Theme" />
        <Card>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-medium text-ink">Theme</p>
              <p className="mt-0.5 text-xs text-ink3">Light — white + wine, always on for now.</p>
            </div>
            <span className="rounded-full border border-brand1/30 bg-brand1/5 px-3 py-1 text-xs font-semibold text-brand1">
              Light
            </span>
          </div>
          <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs leading-5 text-ink3">
            <Eye size={12} aria-hidden="true" />
            Dark mode — coming later. The theme engine is preserved; the toggle stays hidden until it works.
          </p>
        </Card>
      </section>
    </div>
  );
}
