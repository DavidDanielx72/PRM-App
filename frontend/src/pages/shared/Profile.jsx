import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Building2,
  Camera,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Save,
  School,
  UserRound,
  WalletCards,
} from 'lucide-react';

const campusOptions = [
  'CPUT D6 campus',
  'Bellville CPUT campus',
  'CPUT Wellington campus',
  'Mowbray CPUT campus',
  'Other CPUT campuses',
];

export default function Profile() {
  const { user, profile, refreshProfile, isSeller, isAdmin } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [studentNumber, setStudentNumber] = useState(profile?.student_number || '');
  const [campus, setCampus] = useState(profile?.campus || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setStudentNumber(profile?.student_number || '');
    setCampus(profile?.campus || '');
    setAddress(profile?.address || '');
    setBio(profile?.bio || '');
  }, [profile]);

  const role = isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Student';
  const canEditCampus = !isAdmin && !isSeller;
  const canEditAddress = isSeller || !isAdmin;

  async function saveProfile(event) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        student_number: studentNumber.trim() || null,
        bio: bio.trim() || null,
      };

      if (canEditCampus) payload.campus = campus || null;
      if (canEditAddress) payload.address = address.trim() || null;

      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) throw error;

      toast.success('Profile saved successfully');
      await refreshProfile();
    } catch (error) {
      toast.error(error.message || 'Something went wrong while saving your profile');
    } finally {
      setSaving(false);
    }
  }

  async function toggleSellerMode() {
    if (!user) return;

    const nextIsSeller = !isSeller;
    const nextRole = nextIsSeller ? 'seller' : 'student';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole, is_seller: nextIsSeller })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(nextIsSeller ? 'You are now a seller' : 'You are now a student');
      await refreshProfile();
    } catch (error) {
      toast.error(error.message || 'Unable to update account role');
    }
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(10,61,98,0.08)] backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#0a3d62] to-[#1a5fa3] text-2xl font-black text-white shadow-lg shadow-[#0a3d62]/20">
              {fullName?.charAt(0)?.toUpperCase() || 'U'}
              <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#ffb81c] text-[10px] text-[#0a3d62]">
                <BadgeCheck size={12} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile</p>
              <h1 className="text-2xl font-black text-slate-900">{fullName || 'Your profile'}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} className="text-[#0a3d62]" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0a3d62]/8 px-3 py-1.5 text-xs font-semibold text-[#0a3d62]">
              <UserRound size={14} />
              {role}
            </span>
            {!isAdmin && (
              <button
                type="button"
                onClick={toggleSellerMode}
                className="inline-flex items-center justify-center rounded-full border border-[#0a3d62]/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#0a3d62] transition hover:border-[#0a3d62]/20 hover:bg-[#0a3d62]/5"
              >
                {isSeller ? 'Switch to student' : 'Become a seller'}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={saveProfile} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(10,61,98,0.08)] backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#0a3d62] to-[#1a5fa3] text-white shadow-md shadow-[#0a3d62]/20">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
                <p className="text-sm text-slate-500">Keep your contact and campus details accurate.</p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Full name</span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <Phone size={12} /> Phone
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="071 234 5678"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <School size={12} /> Student number
                  </span>
                  <input
                    value={studentNumber}
                    onChange={(event) => setStudentNumber(event.target.value)}
                    placeholder="202512345"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  />
                </label>
              </div>

              {canEditCampus && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <GraduationCap size={12} /> Campus
                  </span>
                  <select
                    value={campus}
                    onChange={(event) => setCampus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  >
                    <option value="">Select campus</option>
                    {campusOptions.map((campusName) => (
                      <option key={campusName} value={campusName}>{campusName}</option>
                    ))}
                  </select>
                </label>
              )}

              {canEditAddress && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <MapPin size={12} /> {isSeller ? 'Business address' : 'Address'}
                  </span>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={isSeller ? 'Enter your business or pickup address' : 'Tell people where you usually meet or collect items'}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(10,61,98,0.08)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffb81c]/15 text-[#0a3d62]">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bio</h3>
                  <p className="text-sm text-slate-500">Tell people a little about yourself.</p>
                </div>
              </div>

              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={6}
                placeholder="Write a short introduction about your study area, interests, or services..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
              />
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(10,61,98,0.08)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0a3d62]/8 text-[#0a3d62]">
                  <WalletCards size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Account summary</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2"><Building2 size={14} className="text-[#0a3d62]" /> Role</span>
                  <strong className="text-slate-900">{role}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2"><GraduationCap size={14} className="text-[#0a3d62]" /> Campus</span>
                  <strong className="text-slate-900">{campus || 'Not set'}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-[#0a3d62]" /> Address</span>
                  <strong className="text-slate-900">{address ? 'Saved' : 'Not set'}</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0a3d62] to-[#1a5fa3] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0a3d62]/20 transition hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0a3d62]/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
