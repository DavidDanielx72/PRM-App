import { useCallback, useEffect, useState } from 'react';
import { Globe2, Heart, MapPin, MessageCircle, Send, UsersRound } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const campusLabel = (campus) => campus || 'your campus';

export default function Community() {
  const { user, profile, isAdmin } = useAuth();
  const tab = 'all';
  const [body, setBody] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commenting, setCommenting] = useState(null);
  const [openComments, setOpenComments] = useState({});

  const loadPosts = useCallback(async () => {
    let query = supabase
      .from('community_posts')
      .select('id, body, campus, created_at, author_id, profiles!community_posts_author_id_fkey(full_name, role, campus)')
      .order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) toast.error(error.message || 'Could not load community posts');
    else {
      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from('community_post_likes').select('post_id, user_id'),
        supabase.from('community_post_comments').select('id, post_id, author_id, body, created_at, profiles!community_post_comments_author_id_fkey(full_name)').order('created_at', { ascending: true }),
      ]);
      const likesByPost = new Map();
      (likes || []).forEach((like) => {
        const current = likesByPost.get(like.post_id) || { count: 0, liked: false };
        current.count += 1;
        current.liked = current.liked || like.user_id === user.id;
        likesByPost.set(like.post_id, current);
      });
      const commentsByPost = new Map();
      (comments || []).forEach((comment) => commentsByPost.set(comment.post_id, [...(commentsByPost.get(comment.post_id) || []), comment]));
      setPosts((data || []).map((post) => ({
        ...post,
        likes: likesByPost.get(post.id) || { count: 0, liked: false },
        comments: commentsByPost.get(post.id) || [],
      })));
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => { if (profile) loadPosts(); }, [profile, loadPosts]);

  useEffect(() => {
    const channel = supabase.channel('community-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, loadPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_post_likes' }, loadPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_post_comments' }, loadPosts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadPosts]);

  const canPost = profile?.role === 'student';
  async function createPost(event) {
    event.preventDefault();
    if (!body.trim() || !profile?.campus) return toast.error('Add your campus to your profile before posting');
    setPosting(true);
    const { data, error } = await supabase.from('community_posts').insert({ author_id: user.id, campus: profile.campus, body: body.trim() }).select('id, body, campus, created_at, author_id, profiles!community_posts_author_id_fkey(full_name, role, campus)').single();
    if (error) toast.error(error.message);
    else { setPosts((current) => [data, ...current]); setBody(''); toast.success('Post shared with the community'); }
    setPosting(false);
  }

  async function toggleLike(post) {
    const nextLiked = !post.likes.liked;
    const { error } = nextLiked
      ? await supabase.from('community_post_likes').insert({ post_id: post.id, user_id: user.id })
      : await supabase.from('community_post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    if (error) return toast.error(error.message || 'Could not update like');
    setPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, likes: { liked: nextLiked, count: item.likes.count + (nextLiked ? 1 : -1) } }
      : item));
  }

  async function addComment(event, post) {
    event.preventDefault();
    const draft = (commentDrafts[post.id] || '').trim();
    if (!draft) return;
    setCommenting(post.id);
    const { data, error } = await supabase.from('community_post_comments')
      .insert({ post_id: post.id, author_id: user.id, body: draft })
      .select('id, post_id, author_id, body, created_at, profiles!community_post_comments_author_id_fkey(full_name)')
      .single();
    if (error) toast.error(error.message || 'Could not add comment');
    else {
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: [...item.comments, data] } : item));
      setCommentDrafts((current) => ({ ...current, [post.id]: '' }));
    }
    setCommenting(null);
  }

  async function deletePost(post) {
    if (!window.confirm('Delete this community post? This cannot be undone.')) return;
    const { error } = await supabase.from('community_posts').delete().eq('id', post.id);
    if (error) return toast.error(error.message || 'Could not delete post');
    setPosts((current) => current.filter((item) => item.id !== post.id));
    toast.success('Post deleted');
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,640px)_280px] lg:py-10">
        <aside className="hidden lg:block">
          <div className="surface-panel sticky top-24 rounded-3xl p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cput-blue-light">Community</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Your campus feed</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">A social noticeboard for students, sellers and campus life.</p>
            <div className="mt-6 rounded-2xl bg-blue-tint p-4"><MapPin size={18} className="text-cput-blue" /><p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Your campus</p><p className="mt-1 font-bold text-cput-blue">{profile?.campus || 'Not set yet'}</p></div>
          </div>
        </aside>

        <section>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cput-blue-light">Campus social</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Community</h2>
          </div>
          {canPost && <form onSubmit={createPost} className="surface-panel mb-5 rounded-3xl p-4 sm:p-5">
            <div className="flex gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cput-blue to-cput-blue-light text-lg font-black text-white">{profile.full_name?.[0]?.toUpperCase() || 'U'}</div><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} placeholder={`Share something with ${campusLabel(profile.campus)}…`} className="min-h-20 flex-1 resize-none rounded-2xl border border-transparent bg-blue-tint/60 p-3 text-sm outline-none transition focus:border-cput-blue/30 focus:bg-white" /></div>
            <div className="mt-3 flex items-center justify-between border-t border-cput-blue/10 pt-3"><span className="text-xs text-slate-400">Posting from <strong className="text-cput-blue">{profile.campus || 'campus'}</strong></span><button disabled={posting || !body.trim()} className="primary gap-2 rounded-full px-4 py-2.5 text-sm"><Send size={15} /> {posting ? 'Posting…' : 'Post'}</button></div>
          </form>}
          <div className="surface-panel mb-5 flex rounded-2xl p-1">
            {[['all', 'All campuses', Globe2]].map(([value, label, Icon]) => <button key={value} type="button" className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${tab === value ? 'bg-cput-blue text-white shadow-md' : 'text-slate-500 hover:bg-blue-tint'}`}><Icon size={16} />{label}</button>)}
          </div>
          {loading ? <div className="surface-panel rounded-3xl p-12 text-center text-sm text-slate-500">Loading the community…</div> : posts.length === 0 ? <div className="surface-panel rounded-3xl p-12 text-center"><UsersRound className="mx-auto text-cput-blue/50" size={36} /><p className="mt-3 font-bold text-slate-700">The community is quiet</p><p className="mt-1 text-sm text-slate-500">Be the first person to share an update.</p></div> : <div className="space-y-4">{posts.map((post) => <article key={post.id} className="surface-panel rounded-3xl p-5"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cput-gold to-amber-300 font-black text-cput-blue">{post.profiles?.full_name?.[0]?.toUpperCase() || '?'}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{post.profiles?.full_name || 'Community member'}</h3><span className="text-xs text-slate-400">· {new Date(post.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}</span></div><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-cput-blue-light"><MapPin size={12} />{post.campus}</p></div>{(isAdmin || post.author_id === user.id) && <button type="button" onClick={() => deletePost(post)} className="text-xs font-bold text-slate-400 transition hover:text-red-500">Delete</button>}</div><p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.body}</p><div className="mt-4 flex gap-5 border-t border-cput-blue/10 pt-3 text-xs font-bold text-slate-400"><button type="button" onClick={() => toggleLike(post)} className={`inline-flex items-center gap-1.5 transition ${post.likes.liked ? 'text-rose-500' : 'hover:text-rose-500'}`}><Heart size={15} fill={post.likes.liked ? 'currentColor' : 'none'} /> {post.likes.count} {post.likes.count === 1 ? 'Like' : 'Likes'}</button><button type="button" onClick={() => setOpenComments((current) => ({ ...current, [post.id]: !current[post.id] }))} className="inline-flex items-center gap-1.5 transition hover:text-cput-blue"><MessageCircle size={15} /> {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</button></div>{openComments[post.id] && <div className="mt-4 border-t border-cput-blue/10 pt-4"><div className="space-y-3">{post.comments.map((comment) => <div className="flex gap-2.5" key={comment.id}><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-tint text-xs font-black text-cput-blue">{comment.profiles?.full_name?.[0]?.toUpperCase() || '?'}</div><div className="rounded-2xl bg-blue-tint/60 px-3 py-2"><p className="text-xs font-bold text-slate-700">{comment.profiles?.full_name || 'Community member'}</p><p className="mt-0.5 text-sm text-slate-600">{comment.body}</p></div></div>)}</div><form onSubmit={(event) => addComment(event, post)} className="mt-4 flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={300} placeholder="Write a comment…" className="input py-2.5" /><button disabled={commenting === post.id || !(commentDrafts[post.id] || '').trim()} className="primary shrink-0 rounded-xl px-3" aria-label="Post comment"><Send size={15} /></button></form></div>}</article>)}</div>}
        </section>
        <aside className="hidden lg:block">
          <div className="surface-blue rounded-3xl p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-cput-blue-light">Feed guide</p><h3 className="mt-2 text-xl font-black text-slate-900">Keep it helpful.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Share opportunities, lost-and-found notices, study tips and campus updates. Be kind and protect personal information.</p></div>
          <div className="surface-panel mt-4 rounded-3xl p-5 text-sm text-slate-500"><p className="flex items-center gap-2 font-bold text-slate-700"><Globe2 size={16} className="text-cput-blue" /> {posts.length} community posts</p></div>
        </aside>
      </main>
    </div>
  );
}
