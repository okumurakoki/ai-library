import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteAllPrompts() {
  console.log('全プロンプトを削除します...');

  const { error } = await supabase
    .from('prompts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // 全件削除

  if (error) {
    console.error('削除エラー:', error);
  } else {
    console.log('削除完了！');
  }
}

deleteAllPrompts();
