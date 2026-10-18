'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';

export default function ChatThread({ caseId, user, role }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const lastMessageRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const url = new URL(`/api/cases/${caseId}/messages`, window.location.origin);
      if (lastMessageRef.current?.createdAt) {
        url.searchParams.set('after', lastMessageRef.current.createdAt);
      }
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Gagal memuat pesan.');
      }
      const data = await response.json();
      setMessages((prev) => {
        const incoming = data.messages || [];
        if (!incoming.length) return prev;
        const merged = [...prev];
        incoming.forEach((item) => {
          if (!merged.some((existing) => existing.id === item.id)) {
            merged.push(item);
          }
        });
        const next = merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        lastMessageRef.current = next.at(-1) || null;
        return next;
      });
    } catch (err) {
      console.error(err);
      setError('Gagal memuat pesan terbaru.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = window.setInterval(() => {
      fetchMessages();
    }, 8000);
    return () => window.clearInterval(interval);
  }, [caseId]);

  useEffect(() => {
    lastMessageRef.current = messages.at(-1) || null;
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const content = draft.trim();
    setSending(true);
    setError('');
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name, role },
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft('');

    try {
      const response = await fetch(`/api/cases/${caseId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim pesan.');
      setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id).concat(data.message));
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id));
      setError(err.message || 'Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages]);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
        <strong style={{ fontSize: 14 }}>Pesan Kasus</strong>
        <div style={{ fontSize: 12, color: '#657068' }}>Diskusi aman untuk klien dan konsultan terkait kasus ini.</div>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && !sortedMessages.length ? <div style={{ fontSize: 13, color: '#657068' }}>Memuat pesan...</div> : null}
        {sortedMessages.map((message) => {
          const isMine = message.sender?.id === user.id;
          return (
            <div key={message.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '10px 12px', borderRadius: 12, background: isMine ? '#3b4a2e' : '#f3f4f6', color: isMine ? '#fff' : '#111827' }}>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{message.sender?.name || 'System'}</div>
                <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{message.content}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>{new Date(message.createdAt).toLocaleString('id-ID')}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {error ? <div style={{ padding: '0 14px 12px', color: '#b91c1c', fontSize: 12 }}>{error}</div> : null}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ketik pesan..."
          style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 999, padding: '10px 12px', fontSize: 13 }}
        />
        <button type="submit" disabled={sending} style={{ border: 'none', width: 40, height: 40, borderRadius: '50%', background: '#3b4a2e', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SendHorizonal size={16} />
        </button>
      </form>
    </div>
  );
}
