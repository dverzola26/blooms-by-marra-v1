import { EnvHttpProxyAgent } from "undici";
const agent =
  process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    ? new EnvHttpProxyAgent()
    : undefined;
// The transport is shared; each Supabase client and session stays request-scoped.
export const supabaseFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, ...(agent ? { dispatcher: agent } : {}) });
