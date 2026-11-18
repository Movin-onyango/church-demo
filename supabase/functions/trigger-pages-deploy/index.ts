import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return respond({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return respond({ error: "Authentication required." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminUserIds = Deno.env.get("PAGES_DEPLOY_ADMIN_USER_IDS")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !adminUserIds?.length) {
    console.error("Missing required trigger-pages-deploy function configuration.");
    return respond({ error: "Deployment trigger is not configured." }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return respond({ error: "Invalid authentication." }, 401);
  }
  if (!adminUserIds.includes(user.id)) {
    return respond({ error: "Administrator access required." }, 403);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: config, error: configError } = await adminClient
    .from("deploy_config")
    .select("value")
    .eq("key", "pages_deploy_hook")
    .single();

  if (configError || typeof config?.value !== "string") {
    console.error("Could not read the Pages deploy hook configuration.", configError);
    return respond({ error: "Deployment hook is not configured." }, 500);
  }

  let hookUrl: URL;
  try {
    hookUrl = new URL(config.value);
  } catch {
    return respond({ error: "Deployment hook URL is invalid." }, 500);
  }
  if (
    hookUrl.protocol !== "https:" ||
    hookUrl.hostname !== "api.cloudflare.com" ||
    !/^\/client\/v4\/pages\/webhooks\/deploy_hooks\/[^/]+$/.test(hookUrl.pathname)
  ) {
    return respond({ error: "Deployment hook URL is invalid." }, 500);
  }

  let deployResponse: Response;
  try {
    deployResponse = await fetch(hookUrl, { method: "POST" });
  } catch (error) {
    console.error("Could not reach the Cloudflare Pages deploy hook.", error);
    return respond({ error: "Could not reach Cloudflare." }, 502);
  }
  if (!deployResponse.ok) {
    console.error("Cloudflare Pages deploy hook request failed.", deployResponse.status);
    return respond({ error: "Cloudflare rejected the deployment request." }, 502);
  }

  return respond({ message: "Deployment triggered." }, 200);
});
