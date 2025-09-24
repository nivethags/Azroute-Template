export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // never leak secrets – just lengths & a validity hint
  const looksValid = url.startsWith("https://") && url.includes(".supabase.co") && !url.endsWith("/");

  return new Response(JSON.stringify({
    node: process.versions.node,
    url_present: Boolean(url),
    url_looks_valid: looksValid,
    anon_key_len: anon.length,
    service_key_len: svc.length,
    url
  }), { status: 200, headers: { "content-type": "application/json" }});
}
