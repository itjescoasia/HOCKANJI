import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User as UserIcon, 
  Shield, 
  ShieldCheck, 
  Check, 
  Copy, 
  Search, 
  Mail, 
  Phone, 
  Clock, 
  X, 
  Users, 
  Save, 
  RefreshCw,
  AlertCircle,
  Key,
  Camera,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  isAdmin,
  onProfileUpdated
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'admin_users'>('profile');
  
  // Profile edit state
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Admin user management state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<{ id: string; msg: string } | null>(null);

  // Sync profile data when modal opens or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setBio(userProfile.bio || '');
      setPhotoURL(userProfile.photoURL || currentUser?.photoURL || '');
    } else if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [userProfile, currentUser, isOpen]);

  // Load all users for Admin
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    setLoadingUsers(true);
    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        list.push({
          uid: docSnap.id,
          id: data.id || docSnap.id,
          email: data.email || 'Không có email',
          displayName: data.displayName || 'Chưa đặt tên',
          role: data.role || 'user',
          photoURL: data.photoURL || null,
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
          createdAt: data.createdAt || 0,
          updatedAt: data.updatedAt || 0
        });
      });

      // Ensure current user and known admins are in list even before doc exists
      if (currentUser && !list.some(u => u.uid === currentUser.uid)) {
        list.unshift({
          uid: currentUser.uid,
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Tài khoản của bạn',
          role: isAdmin ? 'admin' : 'user',
          photoURL: currentUser.photoURL,
          createdAt: Date.now()
        });
      }

      setUsersList(list);
      setLoadingUsers(false);
    }, (err) => {
      console.error('Error fetching users:', err);
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, [isOpen, isAdmin, currentUser]);

  if (!isOpen) return null;

  const currentUid = currentUser?.uid || 'Chưa xác định';
  const effectiveRole: UserRole = userProfile?.role || (isAdmin ? 'admin' : 'user');

  const copyToClipboard = (text: string, isUserList = false, targetId?: string) => {
    navigator.clipboard.writeText(text);
    if (!isUserList) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (targetId) {
      setAdminFeedback({ id: targetId, msg: 'Đã sao chép ID!' });
      setTimeout(() => setAdminFeedback(null), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      // 1. Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null
      });

      // 2. Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedData: Partial<UserProfile> = {
        uid: currentUser.uid,
        id: currentUser.uid,
        email: currentUser.email || '',
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim() || null,
        role: effectiveRole,
        updatedAt: Date.now()
      };

      await setDoc(userRef, updatedData, { merge: true });

      if (onProfileUpdated) {
        onProfileUpdated({
          ...(userProfile || {}),
          ...updatedData
        } as UserProfile);
      }

      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      console.error('Lỗi cập nhật tài khoản:', err);
      setProfileMsg({ type: 'error', text: err.message || 'Không thể lưu thông tin. Vui lòng thử lại.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (!isAdmin) return;
    
    // Safety check: warning if self-demoting
    if (targetUser.uid === currentUser?.uid && newRole === 'user') {
      const confirmSelf = window.confirm(
        'CẢNH BÁO: Bạn đang chuyển tài khoản của chính mình thành "User (Người dùng)". Bạn sẽ mất quyền quản trị viên ngay lập tức. Bạn có chắc chắn không?'
      );
      if (!confirmSelf) return;
    }

    setUpdatingUserId(targetUser.uid);
    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      
      // Check if doc exists; if not, create it
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: targetUser.uid,
          id: targetUser.id || targetUser.uid,
          email: targetUser.email,
          displayName: targetUser.displayName,
          role: newRole,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      } else {
        await updateDoc(userDocRef, {
          role: newRole,
          updatedAt: Date.now()
        });
      }

      setAdminFeedback({ 
        id: targetUser.uid, 
        msg: `Đã đổi quyền thành ${newRole === 'admin' ? 'Admin' : 'User'}` 
      });
      setTimeout(() => setAdminFeedback(null), 3000);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật quyền:', err);
      alert('Lỗi cập nhật quyền: ' + (err.message || 'Không có quyền truy cập.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      u.uid.toLowerCase().includes(q) || 
      (u.id && u.id.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) || 
      (u.displayName && u.displayName.toLowerCase().includes(q));
    
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[20000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-theme-panel border border-theme-subtle w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-theme-subtle flex items-center justify-between bg-theme-base-alt/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-theme-accent/10 border border-theme-accent/30 rounded-lg text-theme-accent">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-theme-primary font-serif tracking-wide">
                  Cài Đặt Tài Khoản
                </h2>
                {effectiveRole === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Crown className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-theme-primary/10 text-theme-primary/70 border border-theme-subtle">
                    <UserIcon className="w-3 h-3" /> User
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-primary/50 mt-0.5">
                Quản lý thông tin tài khoản và hệ thống phân quyền
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-theme-subtle px-5 pt-2 gap-2 bg-theme-panel">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-theme-accent text-theme-accent bg-theme-accent/5'
                : 'border-transparent text-theme-primary/60 hover:text-theme-primary'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Thông Tin Cá Nhân
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin_users')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'admin_users'
                  ? 'border-theme-accent text-theme-accent bg-theme-accent/5'
                  : 'border-transparent text-theme-primary/60 hover:text-theme-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              Quản Lý Tài Khoản & Phân Quyền
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-theme-accent/20 text-theme-accent font-bold">
                {usersList.length}
              </span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'profile' ? (
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Account Identifier Card */}
              <div className="bg-theme-base-alt p-4 rounded-lg border border-theme-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-theme-primary/50 font-semibold block">
                      Mã định danh duy nhất (Account ID)
                    </span>
                    <span className="font-mono text-sm text-theme-accent font-bold break-all">
                      {currentUid}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentUid)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-panel hover:bg-theme-hover border border-theme-subtle rounded text-xs text-theme-primary/80 transition-colors shrink-0"
                    title="Sao chép ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500 font-medium">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép ID</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-theme-subtle/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-theme-primary/60">
                  <span>Vai trò: <strong className="text-theme-primary">{effectiveRole === 'admin' ? 'Quản trị viên (Admin)' : 'Người dùng (User)'}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-theme-primary">{currentUser?.email || 'N/A'}</strong></span>
                </div>
              </div>

              {profileMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-500'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-theme-primary/70 font-semibold mb-1.5">
                    Họ và Tên / Tên hiển thị
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 bg-theme-base border border-theme-subtle rounded-lg text-theme-primary text-sm focus:outline-none focus:border-theme-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-theme-primary/70 font-semibold mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3.5 py-2.5 bg-theme-base border border-theme-subtle rounded-lg text-theme-primary text-sm focus:outline-none focus:border-theme-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-theme-primary/70 font-semibold mb-1.5">
                    Đường dẫn ảnh đại diện (Avatar URL)
                  </label>
                  <div className="flex items-center gap-3">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-theme-subtle object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-theme-base-alt border border-theme-subtle flex items-center justify-center text-theme-primary/40 shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://... (URL hình ảnh đại diện)"
                      className="flex-1 px-3.5 py-2.5 bg-theme-base border border-theme-subtle rounded-lg text-theme-primary text-sm focus:outline-none focus:border-theme-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-theme-primary/70 font-semibold mb-1.5">
                    Ghi chú / Giới thiệu bản thân
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu hoặc mục tiêu học tiếng Nhật của bạn..."
                    className="w-full px-3.5 py-2.5 bg-theme-base border border-theme-subtle rounded-lg text-theme-primary text-sm focus:outline-none focus:border-theme-accent transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-theme-accent text-theme-inverted hover:opacity-90 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Lưu Thay Đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Tab: Admin User Management */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-base-alt/50 p-3 rounded-lg border border-theme-subtle">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-primary/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo ID, Email hoặc Tên..."
                    className="w-full pl-9 pr-3 py-2 bg-theme-base border border-theme-subtle rounded-md text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-theme-primary/60 shrink-0">Lọc quyền:</span>
                  <div className="flex border border-theme-subtle rounded-md overflow-hidden bg-theme-base">
                    {(['all', 'admin', 'user'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          roleFilter === r
                            ? 'bg-theme-accent text-theme-inverted'
                            : 'text-theme-primary/60 hover:text-theme-primary hover:bg-theme-hover'
                        }`}
                      >
                        {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : 'User'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loadingUsers ? (
                <div className="py-12 text-center text-theme-primary/50 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-theme-accent" />
                  <span className="text-xs">Đang tải danh sách tài khoản...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-theme-primary/40 text-xs border border-dashed border-theme-subtle rounded-lg">
                  Không tìm thấy tài khoản nào khớp với tìm kiếm.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-theme-primary/50 font-medium px-1 flex justify-between items-center">
                    <span>Danh sách ({filteredUsers.length} tài khoản)</span>
                    <span className="italic text-[10px]">Chỉ Quản trị viên mới có thể gán quyền Admin/User</span>
                  </div>

                  {filteredUsers.map((u) => {
                    const isMe = u.uid === currentUser?.uid;
                    const isUpdating = updatingUserId === u.uid;
                    const feedback = adminFeedback?.id === u.uid ? adminFeedback.msg : null;

                    return (
                      <div 
                        key={u.uid}
                        className={`p-3.5 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isMe 
                            ? 'bg-theme-accent/5 border-theme-accent/30 shadow-sm' 
                            : 'bg-theme-panel border-theme-subtle hover:border-theme-primary/20'
                        }`}
                      >
                        {/* User Identity Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          {u.photoURL ? (
                            <img 
                              src={u.photoURL} 
                              alt={u.displayName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-theme-subtle object-cover shrink-0 mt-0.5"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-theme-base-alt border border-theme-subtle flex items-center justify-center text-theme-primary/50 shrink-0 mt-0.5">
                              {u.role === 'admin' ? <Crown className="w-5 h-5 text-amber-500" /> : <UserIcon className="w-5 h-5" />}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-theme-primary truncate">
                                {u.displayName}
                              </span>
                              {isMe && (
                                <span className="px-1.5 py-0.2 bg-theme-accent/20 text-theme-accent text-[9px] font-bold uppercase rounded">
                                  Bạn
                                </span>
                              )}
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                  : 'bg-theme-primary/10 text-theme-primary/60 border border-theme-subtle'
                              }`}>
                                {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                              </span>
                            </div>

                            <p className="text-xs text-theme-primary/70 truncate mt-0.5">
                              {u.email}
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] text-theme-primary/40 bg-theme-base-alt px-1.5 py-0.5 rounded border border-theme-subtle/60 truncate max-w-[200px] sm:max-w-[320px]">
                                ID: {u.uid}
                              </span>
                              <button
                                onClick={() => copyToClipboard(u.uid, true, u.uid)}
                                className="p-1 text-theme-primary/40 hover:text-theme-accent transition-colors"
                                title="Sao chép ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              {feedback && (
                                <span className="text-[10px] text-green-500 font-medium">
                                  {feedback}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Role Assignment Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <span className="text-xs text-theme-primary/50 mr-1 hidden sm:inline">
                            Gán quyền:
                          </span>

                          <button
                            disabled={isUpdating || u.role === 'admin'}
                            onClick={() => handleRoleChange(u, 'admin')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                              u.role === 'admin'
                                ? 'bg-amber-500 text-white shadow-sm cursor-default'
                                : 'bg-theme-base hover:bg-amber-500/10 text-theme-primary/60 hover:text-amber-500 border border-theme-subtle'
                            }`}
                            title="Chỉ định làm Quản trị viên"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Admin</span>
                          </button>

                          <button
                            disabled={isUpdating || u.role === 'user'}
                            onClick={() => handleRoleChange(u, 'user')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                              u.role === 'user'
                                ? 'bg-theme-primary text-theme-inverted shadow-sm cursor-default'
                                : 'bg-theme-base hover:bg-theme-hover text-theme-primary/60 hover:text-theme-primary border border-theme-subtle'
                            }`}
                            title="Chuyển về Người dùng thông thường"
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>User</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-theme-subtle bg-theme-base-alt/30 flex justify-between items-center text-xs text-theme-primary/50">
          <span>Hệ thống Kanji Flow • Phân quyền bảo mật RBAC</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-theme-base hover:bg-theme-hover border border-theme-subtle rounded-md text-theme-primary transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
