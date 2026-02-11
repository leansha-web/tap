import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 초기화
 * 환경 변수에서 URL과 anon key를 가져와 클라이언트를 생성한다
 * 이 클라이언트는 프론트엔드(브라우저)에서 사용된다
 */

// Supabase 프로젝트 URL (환경 변수에서 가져옴)
// 빌드 시 환경 변수가 없을 수 있어 기본값을 설정한다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

// Supabase 익명 키 (클라이언트용, 공개 가능)
// 빌드 시 환경 변수가 없을 수 있어 기본값을 설정한다
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Supabase 클라이언트 인스턴스
 * 앱 전체에서 이 인스턴스를 import하여 사용한다
 *
 * 사용 예시:
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('themes').select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
