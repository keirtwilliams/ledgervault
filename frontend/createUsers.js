import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pazfhriqxqqulogffkoez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhemZocmlxeHFxdWxvZ2Zrb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjk2NjMsImV4cCI6MjEwNDk0NTY2M30.-VGnTwkKh6ldvcNq0bHruelhV-1L2FxAgNZ9yXC1BMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAccounts() {
  console.log("Creating Teller Account...");
  const { data: tellerData, error: tellerError } = await supabase.auth.signUp({
    email: 'teller@test.com',
    password: 'password123'
  });
  
  if (tellerError) {
    console.error("Teller Error:", tellerError.message);
  } else {
    console.log("Teller created successfully!");
  }

  console.log("Creating Auditor Account...");
  const { data: auditorData, error: auditorError } = await supabase.auth.signUp({
    email: 'auditor@test.com',
    password: 'password123'
  });

  if (auditorError) {
    console.error("Auditor Error:", auditorError.message);
  } else {
    console.log("Auditor created successfully!");
  }
}

createAccounts();
