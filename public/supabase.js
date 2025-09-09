<!-- Load Supabase client from CDN -->
<script src="https://unpkg.com/@supabase/supabase-js"></script>
<script>
  // ⚠️ Replace these with your actual Supabase project values
  const SUPABASE_URL = "https://wsekbfojaqfumpkmzefu.supabase.co";  
  const SUPABASE_ANON_KEY = "sb_secret_xgJfcM7Sivh4vGszt40aiA_4GpFA7G-";

  // Create a global Supabase client
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log("✅ Supabase client initialized");
</script>
