import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obgelvjksmzziicefptu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBucks() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
}

listBucks().then(() => {
  console.log('process finished');
});
