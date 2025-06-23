"use client";

import Detail from "@/components/user/books/detail";
import { useEffect, useState } from "react";
import { createClient } from '@/app/supabase/client';

export default function Page() {
  const [memberStatus, setMemberStatus] = useState('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setMemberStatus('guest');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('visitors')
          .select('member_status')
          .eq('id', session.user.id)
          .single();
        if (error || !data) {
          setMemberStatus('guest');
        } else {
          setMemberStatus(data.member_status || 'guest');
        }
      } catch (err) {
        setMemberStatus('guest');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberStatus();
  }, []);

  if (loading) return null;
  return <Detail memberStatus={memberStatus} />;
}
