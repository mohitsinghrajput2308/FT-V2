import { useState, useRef, useEffect, useCallback } from 'react';
import {
    User, Mail, Phone, Briefcase, Camera, Save, Shield,
    Eye, EyeOff, Check, Trash2, Info, Clock, Key,
    FileText, AlertTriangle, ChevronDown, Calendar, UserCheck,
    Lock, RefreshCw, BadgeCheck, X, ZoomIn, ZoomOut, HelpCircle, ShieldCheck
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

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

// ─── Image Crop Helpers ───────────────────────────────────────────
const readFile = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result), false);
        reader.readAsDataURL(file);
    });
};

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.src = imageSrc;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size
    );

    return canvas.toDataURL('image/jpeg', 0.82);
};


// ─── Main component ───────────────────────────────────────────────────────────
const Profile = () => {
    const { currentUser, updateProfile, updateDobGender, changePassword, deleteAccount } = useAuth();
    const { plan } = useSubscription();

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

    // ── Image Cropping State ──
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploadingCrop, setIsUploadingCrop] = useState(false);

    // ── personal info form ──
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        occupation: currentUser?.occupation || '',
        bio: currentUser?.bio || '',
    });

    const [secData, setSecData] = useState({
        security_question: '',
        custom_security_question: '',
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



    // ── identity fields (DOB / gender) ──
    const [identityData, setIdentityData] = useState({
        date_of_birth: currentUser?.date_of_birth || '',
        gender: currentUser?.gender || '',
    });
    const [identityLoading, setIdentityLoading] = useState(false);
    const [identityEditing, setIdentityEditing] = useState(false);

    // keep local state in sync when currentUser updates
    useEffect(() => {
        setIdentityData({
            date_of_birth: currentUser?.date_of_birth || '',
            gender: currentUser?.gender || '',
        });
    }, [currentUser?.date_of_birth, currentUser?.gender]);

    const handleIdentitySubmit = async (e) => {
        e.preventDefault();
        if (currentUser?.changesRemaining === 0) {
            showToast('Monthly edit limit reached (3 changes per 30 days).', 'error');
            return;
        }
        if (!identityData.date_of_birth && !identityData.gender) {
            showToast('Please fill in at least one field.', 'error');
            return;
        }
        setIdentityLoading(true);
        const result = await updateDobGender({
            date_of_birth: identityData.date_of_birth || null,
            gender: identityData.gender || null,
        });
        setIdentityLoading(false);
        if (result.success) {
            showToast('Identity information saved!');
            setIdentityEditing(false);
        } else {
            showToast(result.error || 'Failed to save identity info.', 'error');
        }
    };

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
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
        } catch {
            showToast('Failed to load image.', 'error');
        }
        setAvatarLoading(false);
        e.target.value = '';
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCrop = async () => {
        try {
            setIsUploadingCrop(true);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            const result = await updateProfile({ avatar_url: croppedImage });
            if (result.success) {
                setAvatarPreview(croppedImage);
                showToast('Profile picture updated!');
            } else {
                showToast(result.error || 'Failed to upload picture.', 'error');
            }
        } catch (e) {
            showToast('Failed to crop and save image.', 'error');
        }
        setIsUploadingCrop(false);
        setImageSrc(null); // Close modal
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
        let effectiveQuestion = secData.security_question;

        if (effectiveQuestion === '__custom__') {
            effectiveQuestion = secData.custom_security_question?.trim();
            if (!effectiveQuestion) {
                showToast('Please type your custom security question.', 'error');
                return;
            }
        }

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
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentUser?.name}</h2>
                                {plan === 'pro' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border-2 border-amber-400 text-amber-500 dark:border-amber-400 dark:text-amber-400">
                                        ⭐ Pro
                                    </span>
                                )}
                                {plan === 'business' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border-2 border-amber-400 text-amber-500 dark:border-amber-400 dark:text-amber-400">
                                        🏢 Business
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        </div>

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

            {/* ── Identity & Demographics card ── */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary-500" />
                        Identity &amp; Demographics
                    </h3>
                    {!identityEditing && (
                        <button
                            onClick={() => setIdentityEditing(true)}
                            disabled={currentUser?.changesRemaining === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Edit
                        </button>
                    )}
                </div>

                {/* Rate-limit notice */}
                <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        You can update your Date of Birth and Gender only up to <strong>3 times per 30-day period</strong> from your account creation date.
                        {currentUser?.changesRemaining !== null && (
                            <span className="block mt-0.5 font-semibold">
                                {currentUser.changesRemaining > 0
                                    ? `${currentUser.changesRemaining} edit${currentUser.changesRemaining !== 1 ? 's' : ''} remaining this period.`
                                    : `Limit reached. Resets on ${currentUser.windowEnd ? new Date(currentUser.windowEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'next period'}.`
                                }
                            </span>
                        )}
                    </p>
                </div>

                {currentUser?.changesRemaining === 0 && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Monthly edit limit reached. You can no longer change Date of Birth or Gender until the next 30-day period begins.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* UserID — permanent, read-only */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                            <BadgeCheck className="w-4 h-4 text-primary-500" /> User ID
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={currentUser?.username || '—'}
                                readOnly
                                className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400 cursor-not-allowed select-all font-mono"
                            />
                            <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-start gap-1">
                            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            This is your permanent User ID. It is unique and cannot be changed once created.
                        </p>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> Date of Birth
                        </label>
                        {identityEditing ? (
                            <input
                                type="date"
                                value={identityData.date_of_birth || ''}
                                max={new Date().toISOString().split('T')[0]}
                                min="1900-01-01"
                                onChange={e => setIdentityData(p => ({ ...p, date_of_birth: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        ) : (
                            <input
                                type="text"
                                value={currentUser?.date_of_birth
                                    ? new Date(currentUser.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : 'Not set'}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400 cursor-default"
                            />
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                            <User className="w-4 h-4" /> Gender
                        </label>
                        {identityEditing ? (
                            <div className="relative">
                                <select
                                    value={identityData.gender || ''}
                                    onChange={e => setIdentityData(p => ({ ...p, gender: e.target.value }))}
                                    className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="" disabled hidden>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non_binary">Non-binary</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={currentUser?.gender
                                    ? { male: 'Male', female: 'Female', non_binary: 'Non-binary', prefer_not_to_say: 'Prefer not to say' }[currentUser.gender] || currentUser.gender
                                    : 'Not set'}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-400 rounded-lg bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400 cursor-default"
                            />
                        )}
                    </div>
                </div>

                {/* Edit action buttons */}
                {identityEditing && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-dark-400">
                        <Button
                            type="button"
                            loading={identityLoading}
                            icon={Save}
                            onClick={handleIdentitySubmit}
                            disabled={currentUser?.changesRemaining === 0}
                        >
                            Save Identity
                        </Button>
                        <button
                            type="button"
                            onClick={() => {
                                setIdentityEditing(false);
                                setIdentityData({
                                    date_of_birth: currentUser?.date_of_birth || '',
                                    gender: currentUser?.gender || '',
                                });
                            }}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </Card>

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
                                <Select
                                    value={secData.security_question}
                                    onValueChange={(val) => {
                                        setSecData(prev => ({
                                            ...prev,
                                            security_question: val,
                                            custom_security_question: val === '__custom__' ? prev.custom_security_question : ''
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm w-full">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
                                            <SelectValue placeholder="Choose or write your own question" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1B] border-white/10 text-white z-[200]">
                                        {SECURITY_QUESTIONS.map(q => (
                                            <SelectItem key={q} value={q} className="focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">
                                                {q}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__custom__" className="focus:bg-blue-600 focus:text-white cursor-pointer transition-colors font-semibold">
                                            ✏️ Write my own question...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {secData.security_question === '__custom__' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                                    <HelpCircle className="w-4 h-4 text-primary-500" /> Your Custom Question
                                </label>
                                <input
                                    type="text"
                                    name="custom_security_question"
                                    value={secData.custom_security_question || ''}
                                    onChange={handleSecChange}
                                    placeholder="Type your own security question"
                                    maxLength={120}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        )}

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
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">User ID</p>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono break-all">{currentUser?.username || '—'}</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Account Type</p>
                        {plan === 'pro' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border-2 border-amber-400 text-amber-500 dark:border-amber-400 dark:text-amber-400">
                                ⭐ Pro
                            </span>
                        )}
                        {plan === 'business' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border-2 border-amber-400 text-amber-500 dark:border-amber-400 dark:text-amber-400">
                                🏢 Business
                            </span>
                        )}
                        {plan === 'free' && (
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Free</span>
                        )}
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

            {/* ── Image Crop overlay modal ── */}
            {imageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-dark-400 overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-400">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Adjust Profile Picture</h3>
                            <button onClick={() => setImageSrc(null)} disabled={isUploadingCrop} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative flex-1 w-full bg-black/10 dark:bg-black/50 overflow-hidden">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-4 bg-white dark:bg-dark-100 border-t border-gray-100 dark:border-dark-400 space-y-4">
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-dark-400 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-600 transition-colors"
                                />
                                <ZoomIn className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setImageSrc(null)}
                                    disabled={isUploadingCrop}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    onClick={handleSaveCrop}
                                    loading={isUploadingCrop}
                                    icon={Save}
                                >
                                    Save Picture
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

