/** Post-invite / magic-link landing; add this URL to Supabase Auth → Redirect URLs. */
export const AUTH_COMPLETE_INVITE_PATH = "/auth/complete-invite" as const;

export function authCompleteInviteUrl(siteOrigin: string): string {
  const o = siteOrigin.replace(/\/$/, "");
  return `${o}${AUTH_COMPLETE_INVITE_PATH}`;
}
