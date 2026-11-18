# Cloudflare Pages rebuild trigger

The admin dashboard invokes the `trigger-pages-deploy` Supabase Edge Function.
The function validates the signed-in user against an explicit UUID allowlist,
reads the Cloudflare Pages deploy hook from `deploy_config`, and keeps the hook
URL out of browser responses.

## Configure and deploy

1. In `deploy_config`, create a row with key `pages_deploy_hook` and the
   Cloudflare Pages deploy-hook URL as its value.
2. Set the Supabase Edge Function secret `PAGES_DEPLOY_ADMIN_USER_IDS` to a
   comma-separated list of Supabase Auth user UUIDs allowed to trigger builds.
   Do not use email addresses for this allowlist.
3. Ensure the project has its standard `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` Edge Function secrets configured.
4. Deploy the function:

   ```sh
   supabase functions deploy trigger-pages-deploy
   ```

The function uses the service-role key only server-side to read the hook row.
Never expose that key or the Cloudflare hook URL in client-side code.
