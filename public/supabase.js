
<script src="https://unpkg.com/@supabase/supabase-js"></script>

<script>
  
  const SUPABASE_URL = "https://wsekbfojaqfumpkmzefu.supabase.co";  
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZWtiZm9qYXFmdW1wa216ZWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTE4OTgsImV4cCI6MjA3MjgyNzg5OH0.nmOOPd-1fw-78iIgbWtLUdy5O_g9Q8YxwKNEH1d6TzU";

  
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log("✅ Supabase client initialized");
</script>
