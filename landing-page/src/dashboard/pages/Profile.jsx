import { useState, useRef, useEffect, useCallback } from 'react';
import {
    User, Mail, Phone, Briefcase, Camera, Save, Shield,
    Eye, EyeOff, Check, Trash2, Info, Clock, Key,
    FileText, AlertTriangle, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

// ─── Toast notification component ────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    const colors = {
        success: 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
        error: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border rounded-lg shadow-lg text-sm font-medium ${colors[type]} animate-pulse`}>
            {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            {message}
        </div>
    );
};

// ─── Security question options ────────────────────────────────────────────────
const SECURITY_QUESTIONS = [
    'What was the name of your first pet?',
    "What city were you born in?",
    "What is your mother's maiden name?",
    'What was the name of your elementary school?',
    'What was the make of your first car?',
    'What is the name of the street you grew up on?',
    'What was your childhood nickname?',
    "What is your oldest sibling's middle name?",
    'What was the name of your first employer?',
];

// ─── Resize image to max 256×256 and return base64 ───────────────────────────
const resizeImage = (file) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const size = 256;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                const min = Math.min(img.width, img.height);
                const sx = (img.width - min) / 2;
                const sy = (img.height - min) / 2;
                ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });


// ─── Main component ───────────────────────────────────────────────────────────
const Profile = () => {
    const { currentUser, updateProfile, changePassword, deleteAccount } = useAuth();

    // ── toast ──
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

    // ── loading states ──
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // ── avatar ──
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || null);

    // ── personal info form ──
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        occupation: currentUser?.occupation || '',
        bio: currentUser?.bio || '',
    });

    // ── security form ──
    const [secData, setSecData] = useState({
        security_question: currentUser?.security_question || '',
        security_answer: '',
    });

    // ── password form ──
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
        showNew: false,
        showConfirm: false,
    });
    const [passwordErrors, setPasswordErrors] = useState({});



    // ── delete account modal ──
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // sync avatar when currentUser changes
    useEffect(() => {
        if (currentUser?.avatar) setAvatarPreview(currentUser.avatar);
    }, [currentUser?.avatar]);

    // ── handlers ──────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSecChange = (e) => {
        const { name, value } = e.target;
        setSecData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file.', 'error');
            return;
        }
        setAvatarLoading(true);
        try {
            const base64 = await resizeImage(file);
            setAvatarPreview(base64);
            const result = await updateProfile({ avatar_url: base64 });
            if (result.success) {
                showToast('Profile picture updated!');
            } else {
                showToast(result.error || 'Failed to upload picture.', 'error');
                setAvatarPreview(currentUser?.avatar || null);
            }
        } catch {
            showToast('Failed to process image.', 'error');
        }
        setAvatarLoading(false);
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Name cannot be empty.', 'error');
            return;
        }
        setLoading(true);
        const result = await updateProfile({
            full_name: formData.name.trim(),
            phone: formData.phone.trim(),
            occupation: formData.occupation.trim(),
            bio: formData.bio.trim(),
        });
        setLoading(false);
        if (result.success) {
            showToast('Profile information saved!');
        } else {
            showToast(result.error || 'Failed to save profile.', 'error');
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        const effectiveQuestion = secData.security_question;

        if (!effectiveQuestion) {
            showToast('Please select or enter a security question.', 'error');
            return;
        }
        if (!secData.security_answer.trim()) {
            showToast('Please enter an answer to your security question.', 'error');
            return;
        }
        setSecurityLoading(true);
        const result = await updateProfile({
            security_question: effectiveQuestion,
            security_answer: secData.security_answer.trim(),
        });
        setSecurityLoading(false);
        if (result.success) {
            showToast('Security question saved!');
        } else {
            showToast(result.error || 'Failed to save security question.', 'error');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (Object.keys(newErrors).length > 0) {
            setPasswordErrors(newErrors);
            return;
        }
        setPasswordErrors({});
        setPasswordLoading(true);
        const result = await changePassword(passwordData.newPassword);
        setPasswordLoading(false);
        if (result.success) {
            showToast('Password updated successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '', showNew: false, showConfirm: false });
        } else {
            showToast(result.error || 'Failed to update password.', 'error');
        }
    };



    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleteLoading(true);
        const result = await deleteAccount();
        setDeleteLoading(false);
        if (!result.success) {
            showToast(result.error || 'Failed to delete account.', 'error');
            setShowDeleteModal(false);
        }
    };

    // ── helpers ───────────────────────────────────────────────────────────────
    const initials = (currentUser?.name || 'U').charAt(0).toUpperCase();
    const memberSince = currentUser?.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—';
    const lastLogin = currentUser?.lastSignIn
        ? new Date(currentUser.lastSignIn).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—';
    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
            />

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account information and security settings</p>
            </div>

            {/* ── Row 1: Avatar card + Personal info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Avatar / Overview card */}
                <Card className="lg:col-span-1">
                    <div className="text-center space-y-3">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-primary-100 dark:ring-primary-900"
                                />
                            ) : (
                                <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary-100 dark:ring-primary-900">
                                    <span className="text-4xl font-bold text-white">{initials}</span>
                                </div>
                            )}
                            <button
                                onClick={handleAvatarClick}
                                disabled={avatarLoading}
                                title="Upload profile picture"
                                className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white transition-colors shadow-md disabled:opacity-50"
                            >
                                {avatarLoading
                                    ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    : <Camera className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Click the camera icon to upload a photo</p>

                        {/* Name & email */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentUser?.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        </div>

                        {/* Pro badge */}
                        {currentUser?.isPro && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                ⭐ Pro Member
                            </span>
                        )}

                        {/* Stats */}
                        <div className="pt-3 border-t border-gray-100 dark:border-dark-400 space-y-2 text-sm">
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Member since</span>
                                <span className="text-gray-900 dark:text-white font-medium">{memberSince}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Last login</span>
                                <span className="text-gray-900 dark:text-white font-medium text-xs">{lastLogin}</span>
                            </div>
                        </div>


                    </div>
                </Card>

                {/* Personal information form */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        Personal Information
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                icon={User}
                                placeholder="Your full name"
                            />
                            <div>
                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={Mail}
                                    disabled
                                />
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Email cannot be changed here
                                </p>
                            </div>
                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                icon={Phone}
                                placeholder="+1 (555) 000-0000"
                            />
                            <Input
                                label="Occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                icon={Briefcase}
                                placeholder="e.g. Software Engineer"
                            />
                        </div>
                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                                <FileText className="w-4 h-4" /> Bio / About
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                maxLength={300}
                                placeholder="Write a short bio about yourself..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-0.5">{formData.bio.length}/300</p>
                        </div>
                        <Button type="submit" loading={loading} icon={Save}>
                            Save Changes
                        </Button>
                    </form>
                </Card>
            </div>

            {/* ── Row 2: Security question + Change password ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Security question */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-500" />
                        Security Question
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Used to verify your identity if you lose access to your account.
                    </p>
                    <form onSubmit={handleSecuritySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Security Question
                            </label>
                            <div className="relative">
                                <select
                                    name="security_question"
                                    value={secData.security_question}
                                    onChange={handleSecChange}
                                    className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="" disabled hidden>Select a question…</option>
                                    {SECURITY_QUESTIONS.map(q => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Your Answer
                            </label>
                            <input
                                type="password"
                                name="security_answer"
                                value={secData.security_answer}
                                onChange={handleSecChange}
                                placeholder="Enter a secret answer"
                                autoComplete="new-password"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <Button type="submit" loading={securityLoading} icon={Shield}>
                            Save your new Security Question and Answer
                        </Button>
                    </form>
                </Card>

                {/* Change password */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary-500" />
                        Change Password
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Use a strong password with at least 8 characters.
                    </p>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordData.showNew ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                    placeholder="Enter new password"
                                    className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${passwordErrors.newPassword ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-dark-400'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordData(p => ({ ...p, showNew: !p.showNew }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {passwordData.showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && (
                                <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordData.showConfirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="Re-enter new password"
                                    className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${passwordErrors.confirmPassword ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-dark-400'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordData(p => ({ ...p, showConfirm: !p.showConfirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {passwordData.showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                            )}
                        </div>

                        <Button type="submit" loading={passwordLoading} icon={Key}>
                            Update Password
                        </Button>
                    </form>
                </Card>
            </div>

            {/* ── Account details ── */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary-500" />
                    Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Account Type</p>
                        <span className={`text-sm font-semibold ${currentUser?.isPro ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {currentUser?.isPro ? '⭐ Pro' : 'Free'}
                        </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Member Since</p>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{memberSince}</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Sign-in Method</p>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email / Password</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Last Sign In</p>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{lastLogin}</span>
                    </div>
                </div>
            </Card>

            {/* ── Danger zone ── */}
            <Card className="border-2 border-red-200 dark:border-red-900/60">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                </button>
            </Card>

            {/* ── Delete account confirmation modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-dark-400">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Delete Account</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">This action is permanent and irreversible</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            All your data including transactions, budgets, and goals will be permanently deleted.
                            To confirm, type <strong className="text-red-600 dark:text-red-400">DELETE</strong> below.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                {deleteLoading
                                    ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    : <Trash2 className="w-4 h-4" />
                                }
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

