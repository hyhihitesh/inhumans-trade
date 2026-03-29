export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, anonKey, serviceRoleKey, configured: Boolean(url && anonKey) };
}

export function requireSupabaseEnv() {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, anonKey };
}

export function requireSupabaseAdminEnv() {
  const { url, serviceRoleKey } = getSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { url, serviceRoleKey };
}

export function requireZerodhaBrokerEnv() {
  const apiKey = process.env.ZERODHA_API_KEY?.trim();
  const apiSecret = process.env.ZERODHA_API_SECRET?.trim();
  const redirectUri =
    process.env.ZERODHA_REDIRECT_URI?.trim() ||
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/brokers/zerodha/callback`;
  const stateSecret = process.env.BROKER_OAUTH_STATE_SECRET?.trim();
  const tokenSecret = process.env.BROKER_TOKEN_ENCRYPTION_KEY?.trim();

  if (!apiKey || !apiSecret || !redirectUri || !stateSecret || !tokenSecret) {
    throw new Error(
      "Missing Zerodha broker environment variables. Set ZERODHA_API_KEY, ZERODHA_API_SECRET, ZERODHA_REDIRECT_URI (optional), BROKER_OAUTH_STATE_SECRET, and BROKER_TOKEN_ENCRYPTION_KEY."
    );
  }

  return {
    apiKey,
    apiSecret,
    redirectUri,
    stateSecret,
    tokenSecret,
  };
}

export function requireZerodhaSessionEnv() {
  const apiKey = process.env.ZERODHA_API_KEY?.trim();
  const tokenSecret = process.env.BROKER_TOKEN_ENCRYPTION_KEY?.trim();

  if (!apiKey || !tokenSecret) {
    throw new Error(
      "Missing Zerodha session environment variables. Set ZERODHA_API_KEY and BROKER_TOKEN_ENCRYPTION_KEY."
    );
  }

  return {
    apiKey,
    tokenSecret,
  };
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function requireWebPushEnv() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:ops@inhumans.io";

  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing web push environment variables. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
    );
  }

  return {
    publicKey,
    privateKey,
    subject,
  };
}
