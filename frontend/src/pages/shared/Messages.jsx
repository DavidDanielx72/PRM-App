import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { MessageSquareText, SendHorizonal, UserRound, ShieldCheck, Store, ArrowUpRight } from 'lucide-react';

const roleLabel = {
  student: 'Student',
  seller: 'Seller',
  admin: 'Admin',
};

export default function Messages() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const allowedUsers = useMemo(() => {
    if (!profile) return [];

    if (profile.role === 'admin') {
      return ['admin', 'seller', 'student'];
    }
    if (profile.role === 'seller' || profile.is_seller === true) {
      return ['admin', 'student'];
    }
    if (profile.role === 'student') {
      return ['seller'];
    }
    return [];
  }, [profile]);

  const loadContacts = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_seller, email')
      .neq('id', user.id)
      .in('role', allowedUsers)
      .order('full_name');

    if (error) {
      toast.error(error.message || 'Unable to load contacts');
      return;
    }

    const { data: threadRows, error: threadError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (threadError) {
      toast.error(threadError.message || 'Unable to load message threads');
      return;
    }

    const contactIdsWithMessages = new Set(
      (threadRows || []).flatMap(({ sender_id, receiver_id }) => [sender_id, receiver_id])
    );
    contactIdsWithMessages.delete(user.id);

    const visibleContacts = [...(data || [])];
    const missingContactIds = [...contactIdsWithMessages].filter(
      (contactId) => !visibleContacts.some((contact) => contact.id === contactId)
    );

    if (missingContactIds.length > 0) {
      const { data: threadContacts, error: threadContactsError } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_seller, email')
        .in('id', missingContactIds)
        .order('full_name');

      if (threadContactsError) {
        toast.error(threadContactsError.message || 'Unable to load message contacts');
        return;
      }

      visibleContacts.push(...(threadContacts || []));
    }

    visibleContacts.sort((first, second) =>
      (first.full_name || '').localeCompare(second.full_name || '')
    );
    setContacts(visibleContacts);

    const targetId = searchParams.get('to');
    if (targetId && visibleContacts.some((contact) => contact.id === targetId)) {
      setSelectedContactId(targetId);
    } else if (visibleContacts[0]) {
      setSelectedContactId(visibleContacts[0].id);
      if (targetId) setSearchParams({ to: visibleContacts[0].id });
    }
  };

  const loadConversation = async (contactId) => {
    if (!user || !contactId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error(error.message || 'Unable to load conversation');
      setMessages([]);
    } else {
      setMessages(data || []);
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', contactId)
        .eq('is_read', false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || !profile) return;
    loadContacts();
  }, [user, profile, searchParams]);

  useEffect(() => {
    if (!selectedContactId) return;
    loadConversation(selectedContactId);

    if (!user) return;

    const channel = supabase
      .channel(`messages-${user.id}-${selectedContactId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === selectedContactId) ||
            (newMessage.sender_id === selectedContactId && newMessage.receiver_id === user.id)
          ) {
            loadConversation(selectedContactId);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedContactId, user]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!user || !selectedContactId || !text.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedContactId,
      content: text.trim(),
      is_read: false,
    });

    if (error) {
      toast.error(error.message || 'Unable to send message');
      return;
    }

    setText('');
    await loadConversation(selectedContactId);
  }

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || null;

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0a3d62] to-[#1a5fa3] text-white shadow-md shadow-[#0a3d62]/20">
            <MessageSquareText size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Inbox</p>
            <h1 className="text-3xl font-black text-slate-900">Messages</h1>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[30px] border border-cput-blue/15 bg-cput-surface/90 shadow-[0_20px_60px_rgba(10,61,98,0.1)] backdrop-blur-xl lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="border-b border-cput-blue/10 bg-cput-surface-blue/80 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {profile?.role === 'admin' ? 'All users' : profile?.role === 'seller' || profile?.is_seller ? 'Students and admins' : 'Sellers'}
              </p>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-3">
              {contacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No available contacts right now.
                </div>
              ) : (
                contacts.map((contact) => {
                  const isSelected = selectedContactId === contact.id;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        setSelectedContactId(contact.id);
                        setSearchParams({ to: contact.id });
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        isSelected
                          ? 'border-[#0a3d62]/15 bg-[#0a3d62] text-white shadow-lg shadow-[#0a3d62]/15'
                          : 'border-transparent bg-cput-surface hover:border-cput-blue/15 hover:bg-cput-surface-blue text-slate-700'
                      }`}
                    >
                      <div className={`grid h-11 w-11 place-items-center rounded-xl ${isSelected ? 'bg-white/10 text-white' : 'bg-[#0a3d62]/5 text-[#0a3d62]'}`}>
                        {contact.role === 'seller' ? <Store size={18} /> : <UserRound size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold">{contact.full_name || 'Unknown user'}</p>
                          {contact.role === 'seller' && <ShieldCheck size={14} className={isSelected ? 'text-white/80' : 'text-green-500'} />}
                        </div>
                        <p className={`text-xs ${isSelected ? 'text-white/75' : 'text-slate-500'}`}>
                          {roleLabel[contact.role] || 'User'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="flex min-h-[640px] flex-col">
            {selectedContact ? (
              <>
                <header className="flex items-center justify-between border-b border-cput-blue/10 bg-cput-surface/75 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#0a3d62] to-[#1a5fa3] text-white">
                      {selectedContact.role === 'seller' ? <Store size={17} /> : <UserRound size={17} />}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">{selectedContact.full_name}</h2>
                      <p className="text-xs text-slate-500">{roleLabel[selectedContact.role] || 'User'}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0a3d62]/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0a3d62]">
                    <ArrowUpRight size={12} /> Live
                  </span>
                </header>

                <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#f4f7fb_100%)] p-4">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {loading ? (
                      <div className="text-sm text-slate-400">Loading conversation...</div>
                    ) : messages.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                        No messages yet. Start the conversation.
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === user.id;
                        return (
                          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                isMine
                                  ? 'bg-gradient-to-r from-[#0a3d62] to-[#123f64] text-white'
                                  : 'border border-cput-blue/10 bg-cput-surface text-slate-700'
                              }`}
                            >
                              {message.content}
                              <div className={`mt-1 text-[10px] ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="mt-4 flex gap-2 border-t border-cput-blue/10 bg-cput-surface/80 px-3 py-3">
                    <input
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Type your message..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0a3d62] to-[#1a5fa3] px-4 py-3 text-white shadow-lg shadow-[#0a3d62]/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SendHorizonal size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex min-h-[640px] items-center justify-center p-8 text-center text-slate-500">
                Select a contact to start messaging.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
