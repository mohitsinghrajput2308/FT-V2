import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Phone, Calendar as CalendarIcon, ChevronDown, Check, Eye, EyeOff, Sparkles, Wallet, Globe, Loader2, AtSign, X, ShieldCheck, KeyRound, HelpCircle, ArrowLeft, Smartphone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useAuthModal } from '../context/AuthContext';

const TEMP_EMAIL_DOMAINS = [
    'mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
    'trashmail.com', 'yopmail.com', 'dispostable.com', 'tempmail.com'
];

const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What city were you born in?",
    "What was your childhood nickname?",
    "What is the name of your oldest sibling?",
    "What was the make of your first car?",
    "In what city did your parents meet?",
];

const COUNTRIES = [
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+1', flag: '🇨🇦', name: 'Canada' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+7', flag: '🇷🇺', name: 'Russia' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden' },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+353', flag: '🇮🇪', name: 'Ireland' },
];

export const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const { signUp } = useAuthModal();
    const [view, setView] = useState(initialView);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState();
    const [dateInput, setDateInput] = useState('');
    const [strength, setStrength] = useState(0);
    const [emailError, setEmailError] = useState('');

    // Login-specific state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register-specific state
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [userIdError, setUserIdError] = useState('');
    const [userIdStatus, setUserIdStatus] = useState(''); // 'checking' | 'available' | 'taken' | ''
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [customSecurityQuestion, setCustomSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    // Forgot password state
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotUserId, setForgotUserId] = useState('');
    const [forgotFetchedQuestion, setForgotFetchedQuestion] = useState('');
    const [forgotAnswer, setForgotAnswer] = useState('');
    const [forgotEmailInput, setForgotEmailInput] = useState('');

    // Reset password state
    const [newPassword, setNewPassword] = useState('');
    const [newConfirmPassword, setNewConfirmPassword] = useState('');
    const [newStrength, setNewStrength] = useState(0);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Async/feedback state
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    // OTP verification state
    const [verifyEmail, setVerifyEmail] = useState('');
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);

    // 2FA state
    const [twoFAFactorId, setTwoFAFactorId] = useState('');
    const [twoFAQrCode, setTwoFAQrCode] = useState('');
    const [twoFASecret, setTwoFASecret] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [twoFAChallengeId, setTwoFAChallengeId] = useState('');
    const [pendingRedirectSession, setPendingRedirectSession] = useState(null);
    const [forceSetup2FA, setForceSetup2FA] = useState(false);

    // Prove Identity state (for 2FA recovery)
    const [identityQuestion, setIdentityQuestion] = useState('');
    const [identityAnswer, setIdentityAnswer] = useState('');
    const [identitySelectedQuestion, setIdentitySelectedQuestion] = useState('');
    const [identityCustomQuestion, setIdentityCustomQuestion] = useState('');

    useEffect(() => {
        setView(initialView);
        setAuthError('');
        setAuthSuccess('');
        setLoginEmail('');
        setLoginPassword('');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUserId('');
        setUserIdError('');
        setUserIdStatus('');
        setSecurityQuestion('');
        setCustomSecurityQuestion('');
        setSecurityAnswer('');
        setForgotStep(1);
        setForgotUserId('');
        setForgotFetchedQuestion('');
        setForgotAnswer('');
        setForgotEmailInput('');
        setNewPassword('');
        setNewConfirmPassword('');
        setNewStrength(0);
        setStrength(0);
        setTwoFAFactorId('');
        setTwoFAQrCode('');
        setTwoFASecret('');
        setTwoFACode('');
        setTwoFAChallengeId('');
        setPendingRedirectSession(null);
        setForceSetup2FA(false);
        setIdentityQuestion('');
        setIdentityAnswer('');
        setIdentitySelectedQuestion('');
        setIdentityCustomQuestion('');
    }, [initialView, isOpen]);

    const handleForgotByEmail = async () => {
        if (!forgotEmailInput.trim()) { setAuthError('Please enter your email.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        // Check rate limit first
        const { data: limit } = await supabase.rpc('check_reset_rate_limit', { p_email: forgotEmailInput.trim().toLowerCase() });
        if (limit && !limit.allowed) {
            setIsLoading(false);
            const next = limit.next_allowed ? new Date(limit.next_allowed).toLocaleDateString() : 'later';
            setAuthError(`Password reset limit reached (3/week). Try again after ${next}.`);
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmailInput.trim(), {
            redirectTo: window.location.origin,
        });
        setIsLoading(false);
        if (error) { setAuthError(error.message); }
        else { setAuthSuccess('Reset link sent! Check your email inbox.'); }
    };

    const handleForgotUserIdStep1 = async () => {
        if (!forgotUserId.trim()) { setAuthError('Please enter your User ID.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data: question } = await supabase.rpc('get_security_question', { p_username: forgotUserId.trim().toLowerCase() });
        setIsLoading(false);
        if (!question) { setAuthError('No account found with that User ID.'); return; }
        setForgotFetchedQuestion(question);
        setForgotStep(2);
    };

    const handleForgotUserIdStep2 = async () => {
        if (!forgotAnswer.trim()) { setAuthError('Please enter your answer.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data: emailResult } = await supabase.rpc('verify_security_answer_get_email', {
            p_username: forgotUserId.trim().toLowerCase(),
            p_answer: forgotAnswer.trim().toLowerCase(),
        });
        if (!emailResult) {
            setIsLoading(false);
            setAuthError('Incorrect answer. Please try again.');
            return;
        }
        // Check rate limit
        const { data: limit } = await supabase.rpc('check_reset_rate_limit', { p_email: emailResult });
        if (limit && !limit.allowed) {
            setIsLoading(false);
            const next = limit.next_allowed ? new Date(limit.next_allowed).toLocaleDateString() : 'later';
            setAuthError(`Password reset limit reached (3/week). Try again after ${next}.`);
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(emailResult, {
            redirectTo: window.location.origin,
        });
        setIsLoading(false);
        if (error) { setAuthError(error.message); }
        else {
            setAuthSuccess(`✅ Identity verified! A password reset link has been sent to your registered email. Click the link in that email — it will bring you back here to set a new password.`);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword !== newConfirmPassword) { setAuthError('Passwords do not match.'); return; }
        if (newStrength < 100) { setAuthError('Please meet all password requirements.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setIsLoading(false); setAuthError('Session expired. Please request a new reset link.'); return; }
        // Check rate limit
        const { data: limit } = await supabase.rpc('check_reset_rate_limit', { p_email: session.user.email });
        if (limit && !limit.allowed) {
            setIsLoading(false);
            const next = limit.next_allowed ? new Date(limit.next_allowed).toLocaleDateString() : 'later';
            setAuthError(`Password change limit reached (3/week). Try again after ${next}.`);
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) { setIsLoading(false); setAuthError(error.message); return; }
        // Log this password change
        await supabase.from('password_reset_log').insert({ user_email: session.user.email });
        setIsLoading(false);
        setAuthSuccess('Password updated successfully!');
        setTimeout(() => { setView('login'); }, 2000);
    };

    const calculateNewStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s += 20;
        if (/[A-Z]/.test(pass)) s += 20;
        if (/[a-z]/.test(pass)) s += 20;
        if (/[0-9]/.test(pass)) s += 20;
        if (/[^A-Za-z0-9]/.test(pass)) s += 20;
        setNewStrength(s);
    };

    const handleVerify = async () => {
        const token = otpValues.join('');
        if (token.length < 8) { setAuthError('Please enter the complete 8-digit code.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.auth.verifyOtp({ email: verifyEmail, token, type: 'signup' });
        setIsLoading(false);
        if (error) {
            setAuthError(error.message || 'Invalid or expired code. Please try again.');
        } else {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                onClose && onClose();
                window.location.href = '/dashboard';
            } else {
                setLoginEmail(verifyEmail);
                setView('login');
            }
        }
    };

    const handleResendCode = async () => {
        setAuthError('');
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.resend({ type: 'signup', email: verifyEmail });
        setAuthError('');
        // brief feedback via authSuccess
        setAuthSuccess('Code resent! Check your inbox.');
        setTimeout(() => setAuthSuccess(''), 3000);
    };

    const handleOtpChange = (index, value) => {
        const cleaned = value.replace(/\D/g, '').slice(-1);
        const next = [...otpValues];
        next[index] = cleaned;
        setOtpValues(next);
        if (cleaned && index < 7) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            if (prev) prev.focus();
        }
    };

    const handleSignIn = async () => {
        if (!loginEmail.trim() || !loginPassword.trim()) {
            setAuthError('Please fill in all fields.');
            return;
        }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
        setIsLoading(false);
        if (error) {
            setAuthError(error.message || 'Invalid credentials. Please try again.');
            return;
        }
        const session = data?.session;
        if (!session) return;

        // Check enrolled 2FA factors
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];

        if (totpFactor) {
            if (totpFactor.status === 'unverified') {
                // Factor enrolled but never confirmed — clean it up and go straight to setup
                await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
                setPendingRedirectSession(session);
                handleSetup2FA();
                return;
            }
            // Verified factor — require the 6-digit code
            const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
                if (!cErr && challenge) {
                    setTwoFAFactorId(totpFactor.id);
                    setTwoFAChallengeId(challenge.id);
                    setTwoFACode('');
                    setPendingRedirectSession(session);
                    setView('twoFAVerify');
                    return;
                }
            }
        }

        // No verified 2FA — if user just removed 2FA, go straight to setup; else show prompt
        setPendingRedirectSession(session);
        if (forceSetup2FA) {
            setForceSetup2FA(false);
            handleSetup2FA();
        } else {
            setView('twoFAPrompt');
        }
    };

    const handleSkip2FA = () => {
        if (pendingRedirectSession) {
            onClose && onClose();
            window.location.href = '/dashboard';
        }
    };

    const handleSetup2FA = async () => {
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        // First clean up any leftover unverified factors to avoid 'already exists' error
        const { data: existingFactors } = await supabase.auth.mfa.listFactors();
        const allExisting = [...(existingFactors?.totp || []), ...(existingFactors?.phone || [])];
        for (const f of allExisting) {
            if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
        const uniqueName = `FinTrack-${Date.now()}`;
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'Fin Track',
            friendlyName: uniqueName,
        });
        setIsLoading(false);
        if (error) { setAuthError(error.message || 'Failed to start 2FA setup.'); return; }
        setTwoFAFactorId(data.id);
        setTwoFAQrCode(data.totp.qr_code);
        setTwoFASecret(data.totp.secret);
        setTwoFACode('');
        setView('twoFASetup');
    };

    const handleConfirm2FA = async () => {
        if (!twoFACode || twoFACode.length !== 6) { setAuthError('Enter the 6-digit code from your authenticator app.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: twoFAFactorId });
        if (cErr) { setIsLoading(false); setAuthError(cErr.message); return; }
        const { error } = await supabase.auth.mfa.verify({ factorId: twoFAFactorId, challengeId: challenge.id, code: twoFACode });
        setIsLoading(false);
        if (error) { setAuthError('Invalid code. Please try again — make sure your device clock is correct.'); return; }
        setAuthSuccess('2FA enabled! Your account is now extra secure. 🎉');
        setTimeout(() => {
            if (pendingRedirectSession) {
                onClose && onClose();
                window.location.href = '/dashboard';
            }
        }, 1800);
    };

    const handleVerify2FA = async () => {
        if (!twoFACode || twoFACode.length !== 6) { setAuthError('Enter the 6-digit code from your authenticator app.'); return; }
        setAuthError('');
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { error } = await supabase.auth.mfa.verify({ factorId: twoFAFactorId, challengeId: twoFAChallengeId, code: twoFACode });
            setIsLoading(false);
            if (error) { setAuthError('Invalid code. Please try again.'); return; }
            // Verify succeeded — close modal and redirect (no need to re-check session)
            onClose && onClose();
            window.location.href = '/dashboard';
        } catch (err) {
            setIsLoading(false);
            setAuthError('Something went wrong. Please try again.');
        }
    };

    const handleStartIdentityVerify = () => {
        setAuthError('');
        setAuthSuccess('');
        setIdentityAnswer('');
        setIdentitySelectedQuestion('');
        setIdentityCustomQuestion('');
        setView('proveIdentity');
    };

    const handleVerifyIdentity = async () => {
        const chosenQuestion = identitySelectedQuestion === '__custom__' ? identityCustomQuestion.trim() : identitySelectedQuestion;
        if (!chosenQuestion) { setAuthError('Please select or type your security question.'); return; }
        if (identitySelectedQuestion === '__custom__' && chosenQuestion.length < 5) { setAuthError('Your custom question is too short.'); return; }
        if (!identityAnswer.trim()) { setAuthError('Please enter your answer.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        const username = user?.user_metadata?.username;
        if (!username) { setIsLoading(false); setAuthError('Session error. Please sign in again.'); return; }
        // First verify the question matches what they set during registration
        const { data: storedQuestion } = await supabase.rpc('get_security_question', { p_username: username });
        if (!storedQuestion) { setIsLoading(false); setAuthError('No security question found for this account.'); return; }
        if (storedQuestion.trim().toLowerCase() !== chosenQuestion.toLowerCase()) {
            setIsLoading(false);
            setAuthError('Incorrect security question. Please try again.');
            return;
        }
        // Now verify the answer via RPC
        const { data: emailResult } = await supabase.rpc('verify_security_answer_get_email', {
            p_username: username,
            p_answer: identityAnswer.trim().toLowerCase(),
        });
        if (!emailResult) {
            setIsLoading(false);
            setAuthError('Incorrect answer. Please try again.');
            return;
        }
        // Both question and answer correct — remove factors server-side, get fresh session, go to setup
        setAuthSuccess('Identity verified! Setting up new authenticator...');
        // Use server-side RPC to delete MFA factors (bypasses AAL2 requirement)
        const { data: removed, error: removeErr } = await supabase.rpc('remove_user_mfa_factors');
        if (removeErr || !removed) {
            setIsLoading(false);
            setAuthError('Could not remove existing 2FA. Please try again or contact support.');
            return;
        }
        // Sign out to destroy the AAL2-tainted session, then auto re-sign-in for a clean AAL1 session
        await supabase.auth.signOut();
        const { data: freshLogin, error: reLoginErr } = await supabase.auth.signInWithPassword({
            email: loginEmail.trim(),
            password: loginPassword,
        });
        if (reLoginErr || !freshLogin?.session) {
            setIsLoading(false);
            setAuthError('Re-authentication failed. Please sign in manually.');
            setView('login');
            return;
        }
        setPendingRedirectSession(freshLogin.session);
        setIsLoading(false);
        setTwoFACode('');
        setAuthError('');
        // Fresh session with no factors — enroll will succeed
        handleSetup2FA();
    };

    const handleSignUp = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim() || !userId.trim()) {
            setAuthError('Please fill in all required fields.');
            return;
        }
        const effectiveQuestion = securityQuestion === '__custom__' ? customSecurityQuestion.trim() : securityQuestion;
        if (!effectiveQuestion || !securityAnswer.trim()) { setAuthError('Please enter a security question and provide an answer.'); return; }
        if (securityQuestion === '__custom__' && effectiveQuestion.length < 5) { setAuthError('Your custom question is too short.'); return; }
        if (userIdError || userIdStatus === 'taken') { setAuthError('Please choose a different User ID.'); return; }
        if (userIdStatus !== 'available') { setAuthError('Please wait for User ID check to complete.'); return; }
        if (emailError) { setAuthError('Please use a valid email address.'); return; }
        if (password !== confirmPassword) { setAuthError('Passwords do not match.'); return; }
        if (strength < 100) { setAuthError('Please meet all password requirements.'); return; }
        setAuthError('');
        setIsLoading(true);
        const { data, error } = await signUp(email.trim(), password, {
            full_name: fullName.trim(),
            username: userId.trim().toLowerCase(),
            security_question: securityQuestion === '__custom__' ? customSecurityQuestion.trim() : securityQuestion,
            security_answer: securityAnswer.trim().toLowerCase(),
            phone: phone ? `${countryCode}${phone}` : null,
            gender: gender || null,
            date_of_birth: birthDate ? birthDate.toISOString().split('T')[0] : null,
        });
        setIsLoading(false);
        if (error) {
            const msg = error.message || '';
            if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('user already')) {
                setLoginEmail(email.trim());
                setView('login');
                setAuthError('This email is already registered. Please sign in.');
            } else if (msg.toLowerCase().includes('signups not allowed') || msg.toLowerCase().includes('signup') || msg.toLowerCase().includes('disabled')) {
                setAuthError('New sign-ups are temporarily disabled. Please contact support.');
            } else {
                setAuthError(msg);
            }
        } else if (data?.session) {
            // Email confirmation is OFF — session issued immediately, redirect to app
            onClose && onClose();
            window.location.href = '/dashboard';
        } else {
            // Email confirmation is ON — show OTP verify screen
            setVerifyEmail(email.trim());
            setOtpValues(['', '', '', '', '', '', '', '']);
            setView('verify');
        }
    };

    const validateUserId = (val) => {
        const cleaned = val.replace(/[^a-zA-Z0-9_]/g, '');
        setUserId(cleaned);
        setUserIdStatus('');
        setUserIdError('');
        if (!cleaned) return;
        if (cleaned.length < 3) { setUserIdError('Must be at least 3 characters'); return; }
        if (cleaned.length > 20) { setUserIdError('Max 20 characters'); return; }
        // debounce check
        setUserIdStatus('checking');
        clearTimeout(window._userIdTimer);
        window._userIdTimer = setTimeout(async () => {
            try {
                const { supabase } = await import('@/lib/supabase');
                const { data, error } = await supabase.rpc('check_username_available', { p_username: cleaned.toLowerCase() });
                if (error) { setUserIdStatus(''); return; }
                setUserIdStatus(data ? 'available' : 'taken');
                if (!data) setUserIdError('This User ID is already taken');
            } catch { setUserIdStatus(''); }
        }, 500);
    };

    const calculateStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s += 20;
        if (/[A-Z]/.test(pass)) s += 20;
        if (/[a-z]/.test(pass)) s += 20;
        if (/[0-9]/.test(pass)) s += 20;
        if (/[^A-Za-z0-9]/.test(pass)) s += 20;
        setStrength(s);
    };

    const validateEmail = (val) => {
        setEmail(val);
        const domain = val.split('@')[1];
        if (domain && TEMP_EMAIL_DOMAINS.includes(domain.toLowerCase())) {
            setEmailError('Temporary emails are not allowed');
        } else {
            setEmailError('');
        }
    };

    const handleDateChange = (val) => {
        // Remove all non-numeric characters
        const cleaned = val.replace(/\D/g, '');
        let formatted = cleaned;

        // Auto-format DD-MM-YYYY
        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
        }

        setDateInput(formatted);

        // If we have a full date, try to parse it
        if (cleaned.length === 8) {
            const day = parseInt(cleaned.slice(0, 2));
            const month = parseInt(cleaned.slice(2, 4));
            const year = parseInt(cleaned.slice(4, 8));
            const date = new Date(year, month - 1, day);

            if (date && date.getFullYear() === year && date.getMonth() === month - 1) {
                setBirthDate(date);
            }
        }
    };

    // Keep dateInput in sync with birthDate when selected via calendar
    useEffect(() => {
        if (birthDate) {
            const d = birthDate.getDate().toString().padStart(2, '0');
            const m = (birthDate.getMonth() + 1).toString().padStart(2, '0');
            const y = birthDate.getFullYear();
            setDateInput(`${d}-${m}-${y}`);
        }
    }, [birthDate]);

    const strengthColor = strength <= 20 ? 'bg-red-500' :
        strength <= 60 ? 'bg-yellow-500' :
            'bg-emerald-500';

    const strengthLabel = strength <= 20 ? 'WEAK' :
        strength <= 40 ? 'FAIR' :
            strength <= 60 ? 'GOOD' :
                strength <= 80 ? 'STRONG' : 'VERY STRONG';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-transparent shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="relative bg-[#0A0A0B] border border-white/10 rounded-[40px] overflow-hidden p-8 sm:p-10 shadow-2xl">
                    {/* Top Decorative Icon */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2DD4BF] to-[#2563EB] rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-500/20 transform rotate-0 transition-transform hover:scale-110 duration-500">
                            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                        </div>
                    </div>

                    {view === 'login' ? (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-1 sm:space-y-2">
                                <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">Welcome Back</h2>
                                <p className="text-gray-400 text-[14px] sm:text-[15px]">Please enter your details</p>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-2 sm:space-y-3">
                                    <Label className="text-white font-semibold text-[14px] ml-1">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="pl-12 bg-[#1A1A1B] border-white/5 text-white placeholder:text-gray-600 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-[14px] h-[52px] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-white font-semibold text-[14px]">Password</Label>
                                        <button onClick={() => { setView('forgot'); setAuthError(''); setAuthSuccess(''); setForgotStep(1); setForgotUserId(''); setForgotFetchedQuestion(''); setForgotAnswer(''); setForgotEmailInput(''); }} className="text-blue-500 text-[13px] font-bold hover:text-blue-400 transition-colors">Forgot?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-12 pr-12 bg-[#1A1A1B] border-white/5 text-white placeholder:text-gray-600 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-[14px] h-[52px] transition-all"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {authError && view === 'login' && (
                                <p className="text-red-400 text-[13px] text-center font-medium bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>
                            )}

                            <Button
                                onClick={handleSignIn}
                                disabled={isLoading}
                                className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] border border-transparent hover:border-blue-400 hover:ring-4 hover:ring-blue-500/30 text-white hover:text-white h-[56px] rounded-[16px] font-black text-[16px] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                            </Button>

                            <div className="text-center pt-1 sm:pt-2">
                                <p className="text-gray-400 text-[14px] font-medium">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setView('register')}
                                        className="text-blue-500 font-bold hover:underline ml-1"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </div>
                        </div>
                    ) : view === 'verify' ? (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                                        <Mail className="w-7 h-7 text-emerald-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight">Verify Your Email</h2>
                                <p className="text-gray-400 text-[13px] sm:text-[14px]">
                                    We sent an 8-digit code to<br />
                                    <span className="text-white font-semibold">{verifyEmail}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otpValues.map((val, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={val}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
                                            const next = ['', '', '', '', '', '', '', ''];
                                            paste.split('').forEach((c, i) => { next[i] = c; });
                                            setOtpValues(next);
                                            const last = Math.min(paste.length, 5);
                                            setTimeout(() => { const el = document.getElementById(`otp-${last}`); if (el) el.focus(); }, 10);
                                        }}
                                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] font-bold text-white bg-[#1A1A1B] border border-white/10 rounded-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all caret-blue-400"
                                    />
                                ))}
                            </div>

                            {authError && view === 'verify' && (
                                <p className="text-red-400 text-[13px] text-center font-medium bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>
                            )}
                            {authSuccess && (
                                <p className="text-emerald-400 text-[13px] text-center font-medium bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>
                            )}

                            <Button
                                onClick={handleVerify}
                                disabled={isLoading || otpValues.join('').length < 8}
                                className={`w-full h-[52px] sm:h-[56px] rounded-[16px] font-black text-[16px] transition-all border border-transparent ${
                                    otpValues.join('').length === 8 && !isLoading
                                        ? 'bg-[#2563EB] hover:bg-blue-600 text-white hover:scale-[1.01] hover:ring-4 hover:ring-blue-500/30 hover:border-blue-400 shadow-xl shadow-blue-500/20'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Continue'}
                            </Button>

                            <div className="text-center space-y-2">
                                <p className="text-gray-500 text-[13px]">
                                    Didn't receive the code?{' '}
                                    <button onClick={handleResendCode} className="text-blue-500 font-bold hover:underline">Resend</button>
                                </p>
                                <p className="text-gray-600 text-[12px]">
                                    <button onClick={() => setView('register')} className="hover:text-gray-400 transition-colors">← Back to sign up</button>
                                </p>
                            </div>
                        </div>
                    ) : view === 'forgot' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <h2 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight">Recover Account</h2>
                                <p className="text-gray-400 text-[14px]">Choose how you want to reset your password</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setView('forgotByUserId'); setForgotStep(1); setAuthError(''); setAuthSuccess(''); }}
                                    className="group flex flex-col items-center gap-3 p-6 bg-[#1A1A1B] border border-white/10 rounded-[20px] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                >
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-[14px] flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-[14px]">Via Security Question</p>
                                        <p className="text-gray-500 text-[11px] mt-0.5">Use your User ID + secret answer</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setView('forgotByEmail'); setAuthError(''); setAuthSuccess(''); }}
                                    className="group flex flex-col items-center gap-3 p-6 bg-[#1A1A1B] border border-white/10 rounded-[20px] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                >
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-[14px] flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                                        <Mail className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-[14px]">Via Email</p>
                                        <p className="text-gray-500 text-[11px] mt-0.5">Send reset link to your email</p>
                                    </div>
                                </button>
                            </div>

                            <div className="text-center">
                                <button onClick={() => { setView('login'); setAuthError(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">← Back to Sign In</button>
                            </div>
                        </div>
                    ) : view === 'forgotByEmail' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                                        <Mail className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Reset via Email</h2>
                                <p className="text-gray-400 text-[13px]">Enter your registered email address</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white font-semibold text-[13px] ml-1">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        value={forgotEmailInput}
                                        onChange={(e) => setForgotEmailInput(e.target.value)}
                                        placeholder="Enter your email"
                                        className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}
                            {authSuccess && <p className="text-emerald-400 text-[13px] text-center bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>}

                            <Button onClick={handleForgotByEmail} disabled={isLoading} className="w-full h-[52px] rounded-[16px] font-black text-[16px] bg-[#2563EB] hover:bg-blue-600 text-white transition-all">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                            </Button>

                            <div className="text-center">
                                <button onClick={() => { setView('forgot'); setAuthError(''); setAuthSuccess(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">← Back</button>
                            </div>
                        </div>
                    ) : view === 'forgotByUserId' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Reset via User ID</h2>
                                <p className="text-gray-400 text-[13px]">
                                    {forgotStep === 1 ? 'Enter your User ID to find your account' : 'Answer your security question'}
                                </p>
                            </div>

                            {/* Step indicator */}
                            <div className="flex items-center gap-2 justify-center">
                                {[1, 2].map((s) => (
                                    <div key={s} className={`h-1.5 w-16 rounded-full transition-all ${forgotStep >= s ? 'bg-blue-500' : 'bg-white/10'}`} />
                                ))}
                            </div>

                            {forgotStep === 1 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold text-[13px] ml-1">User ID</Label>
                                        <div className="relative group">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <Input
                                                value={forgotUserId}
                                                onChange={(e) => setForgotUserId(e.target.value)}
                                                placeholder="Enter your User ID"
                                                className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}

                                    <Button onClick={handleForgotUserIdStep1} disabled={isLoading} className="w-full h-[52px] rounded-[16px] font-black text-[16px] bg-[#2563EB] hover:bg-blue-600 text-white transition-all">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Find My Account'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-[14px] px-4 py-3">
                                        <p className="text-gray-400 text-[11px] uppercase font-bold tracking-wider mb-1">Security Question</p>
                                        <p className="text-white font-semibold text-[14px]">{forgotFetchedQuestion}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white font-semibold text-[13px] ml-1">Your Answer</Label>
                                        <div className="relative group">
                                            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <Input
                                                value={forgotAnswer}
                                                onChange={(e) => setForgotAnswer(e.target.value)}
                                                placeholder="Enter your answer"
                                                className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}
                                    {authSuccess && <p className="text-emerald-400 text-[13px] text-center bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>}

                                    <Button onClick={handleForgotUserIdStep2} disabled={isLoading} className="w-full h-[52px] rounded-[16px] font-black text-[16px] bg-[#2563EB] hover:bg-blue-600 text-white transition-all">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Send Reset Link'}
                                    </Button>

                                    <div className="text-center">
                                        <button onClick={() => { setForgotStep(1); setAuthError(''); setForgotFetchedQuestion(''); setForgotAnswer(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">← Try different User ID</button>
                                    </div>
                                </div>
                            )}

                            {forgotStep === 1 && (
                                <div className="text-center">
                                    <button onClick={() => { setView('forgot'); setAuthError(''); setAuthSuccess(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">← Back</button>
                                </div>
                            )}
                        </div>
                    ) : view === 'resetPassword' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                                        <KeyRound className="w-7 h-7 text-emerald-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Set New Password</h2>
                                <p className="text-gray-400 text-[13px]">You can change your password up to 3 times per week</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); calculateNewStrength(e.target.value); }}
                                            placeholder="••••••••"
                                            className="pl-12 pr-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Confirm Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            type="password"
                                            value={newConfirmPassword}
                                            onChange={(e) => setNewConfirmPassword(e.target.value)}
                                            placeholder="Confirm"
                                            className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Strength indicator */}
                            <div className="bg-[#050505]/80 rounded-[16px] p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Strength</span>
                                    <span className={`text-[10px] font-black uppercase ${newStrength <= 20 ? 'text-red-500' : newStrength <= 60 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                        {newStrength <= 20 ? 'WEAK' : newStrength <= 40 ? 'FAIR' : newStrength <= 60 ? 'GOOD' : newStrength <= 80 ? 'STRONG' : 'VERY STRONG'}
                                    </span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    {[20, 40, 60, 80, 100].map((step) => (
                                        <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${newStrength >= step ? (newStrength <= 20 ? 'bg-red-500' : newStrength <= 60 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-white/5'}`} />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: '8+ Chars', met: newPassword.length >= 8 },
                                        { label: 'Uppercase', met: /[A-Z]/.test(newPassword) },
                                        { label: 'Lowercase', met: /[a-z]/.test(newPassword) },
                                        { label: 'Number', met: /[0-9]/.test(newPassword) },
                                        { label: 'Symbol', met: /[^A-Za-z0-9]/.test(newPassword) },
                                    ].map((rule) => (
                                        <div key={rule.label} className="flex items-center gap-1">
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${rule.met ? 'bg-emerald-500 border-emerald-500' : 'border-white/10'}`}>
                                                <Check className="w-2 h-2 stroke-[4] text-white" />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase ${rule.met ? 'text-emerald-500' : 'text-gray-500'}`}>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}
                            {authSuccess && <p className="text-emerald-400 text-[13px] text-center bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>}

                            <Button
                                onClick={handleResetPassword}
                                disabled={isLoading || newStrength < 100 || newPassword !== newConfirmPassword}
                                className={`w-full h-[52px] rounded-[16px] font-black text-[16px] transition-all border border-transparent ${newStrength === 100 && newPassword === newConfirmPassword && !isLoading ? 'bg-[#2563EB] hover:bg-blue-600 text-white hover:scale-[1.01] shadow-xl shadow-blue-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Set New Password'}
                            </Button>
                        </div>
                    ) : view === 'twoFAPrompt' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Secure Your Account</h2>
                                <p className="text-gray-400 text-[13px] max-w-[320px] mx-auto">
                                    Add an extra layer of security with Two-Factor Authentication (2FA). It only takes 30 seconds — completely optional.
                                </p>
                            </div>

                            <div className="bg-[#1A1A1B] border border-white/10 rounded-[16px] p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-[13px]">Protects against stolen passwords</p>
                                        <p className="text-gray-500 text-[12px]">Even if someone knows your password, they can't log in without your phone</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-[13px]">Works with any authenticator app</p>
                                        <p className="text-gray-500 text-[12px]">Google Authenticator, Authy, Microsoft Authenticator &amp; more</p>
                                    </div>
                                </div>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}

                            <Button
                                onClick={handleSetup2FA}
                                disabled={isLoading}
                                className="w-full h-[52px] rounded-[16px] font-black text-[16px] bg-[#2563EB] hover:bg-blue-600 text-white transition-all hover:scale-[1.01] shadow-xl shadow-blue-500/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '🔐 Enable 2FA (Recommended)'}
                            </Button>

                            <button onClick={handleSkip2FA} className="w-full text-gray-500 text-[13px] hover:text-white transition-colors py-1">
                                Skip for now, continue to app →
                            </button>
                        </div>
                    ) : view === 'twoFASetup' ? (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                                        <Smartphone className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                                <h2 className="text-[26px] font-bold text-white">Setup Authenticator</h2>
                                <p className="text-gray-400 text-[13px]">Scan the QR code with your authenticator app, then enter the 6-digit code to confirm</p>
                            </div>

                            {twoFAQrCode && (
                                <div className="flex justify-center">
                                    <div className="bg-white p-3 rounded-[16px] shadow-lg inline-flex items-center justify-center">
                                        <img src={twoFAQrCode} alt="QR Code for 2FA setup" className="w-44 h-44 block" />
                                    </div>
                                </div>
                            )}

                            {twoFASecret && (
                                <div className="bg-[#1A1A1B] border border-white/10 rounded-[12px] p-3">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">Manual entry key (if QR doesn't work)</p>
                                    <p className="text-white font-mono text-[12px] tracking-widest break-all select-all">{twoFASecret}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-white font-semibold text-[13px] ml-1">Enter 6-digit code to confirm setup</Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoFocus
                                        className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[52px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-[0.4em] text-center text-[20px] font-bold"
                                    />
                                </div>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}
                            {authSuccess && <p className="text-emerald-400 text-[13px] text-center bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>}

                            <Button
                                onClick={handleConfirm2FA}
                                disabled={isLoading || twoFACode.length !== 6}
                                className={`w-full h-[52px] rounded-[16px] font-black text-[16px] transition-all border border-transparent ${twoFACode.length === 6 && !isLoading ? 'bg-[#2563EB] hover:bg-blue-600 text-white hover:scale-[1.01] shadow-xl shadow-blue-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Activate 2FA & Continue'}
                            </Button>

                            <button onClick={handleSkip2FA} className="w-full text-gray-500 text-[13px] hover:text-white transition-colors py-1">
                                Skip for now →
                            </button>
                        </div>
                    ) : view === 'twoFAVerify' ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="w-7 h-7 text-blue-400" />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Two-Factor Auth</h2>
                                <p className="text-gray-400 text-[13px]">Enter the 6-digit code from your authenticator app</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white font-semibold text-[13px] ml-1">Authentication Code</Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoFocus
                                        className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[56px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-[0.4em] text-center text-[22px] font-bold"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#1A1A1B] border border-white/10 rounded-[12px] p-3 flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-gray-400 text-[12px]">Open Google Authenticator, Authy, or the TOTP app where you set up 2FA to get your current 6-digit code.</p>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}

                            <Button
                                onClick={handleVerify2FA}
                                disabled={isLoading || twoFACode.length !== 6}
                                className={`w-full h-[56px] rounded-[16px] font-black text-[16px] transition-all border border-transparent ${twoFACode.length === 6 && !isLoading ? 'bg-[#2563EB] hover:bg-blue-600 text-white hover:scale-[1.01] hover:ring-4 hover:ring-blue-500/30 shadow-xl shadow-blue-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Sign In'}
                            </Button>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-[12px] p-3 flex items-start gap-3">
                                <span className="text-amber-400 text-[18px] leading-none mt-0.5">⚠</span>
                                <div>
                                    <p className="text-amber-300 text-[12px] font-semibold mb-1">Lost access to your authenticator?</p>
                                    <p className="text-gray-400 text-[11px] mb-1">If you deleted the app or lost your device, you can set up 2FA again after giving security question and answer.</p>
                                    <p className="text-amber-400 text-[11px] font-semibold mb-2">NOTE : Your previous authenticator will be permanently removed.</p>
                                    <button
                                        onClick={handleStartIdentityVerify}
                                        disabled={isLoading}
                                        className="text-amber-400 text-[12px] font-bold hover:text-amber-300 transition-colors underline underline-offset-2 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing...' : 'Set up another 2FA'}
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <button onClick={() => { setView('login'); setAuthError(''); setTwoFACode(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">
                                    ← Go back to sign in page
                                </button>
                            </div>
                        </div>
                    ) : view === 'proveIdentity' ? (
                        <div className="space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-3">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-amber-500/20">
                                            <ShieldCheck className="w-8 h-8 text-amber-400" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-bold text-white">Prove Your Identity</h2>
                                <p className="text-gray-400 text-[13px]">Select the security question you chose during registration and provide the correct answer</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white font-semibold text-[13px] ml-1">Your Security Question</Label>
                                <Select value={identitySelectedQuestion} onValueChange={(val) => { setIdentitySelectedQuestion(val); if (val !== '__custom__') setIdentityCustomQuestion(''); setAuthError(''); }}>
                                    <SelectTrigger className="bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[56px] focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
                                            <SelectValue placeholder="Choose the question you set during registration" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1B] border-white/10 text-white">
                                        {SECURITY_QUESTIONS.map((q) => (
                                            <SelectItem key={q} value={q}>{q}</SelectItem>
                                        ))}
                                        <SelectItem value="__custom__">✏️ I had my own custom question...</SelectItem>
                                    </SelectContent>
                                </Select>
                                {identitySelectedQuestion === '__custom__' && (
                                    <div className="relative group mt-2">
                                        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                                        <Input
                                            value={identityCustomQuestion}
                                            onChange={(e) => setIdentityCustomQuestion(e.target.value)}
                                            placeholder="Type the exact custom question you set"
                                            maxLength={120}
                                            autoFocus
                                            className="pl-12 bg-[#1A1A1B] border-amber-500/40 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white font-semibold text-[13px] ml-1">Your Answer</Label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        value={identityAnswer}
                                        onChange={(e) => setIdentityAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        onKeyDown={(e) => e.key === 'Enter' && identityAnswer.trim() && handleVerifyIdentity()}
                                        className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[56px] focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                            </div>

                            {authError && <p className="text-red-400 text-[13px] text-center bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>}
                            {authSuccess && <p className="text-emerald-400 text-[13px] text-center bg-emerald-500/10 rounded-[12px] px-4 py-2">{authSuccess}</p>}

                            <Button
                                onClick={handleVerifyIdentity}
                                disabled={isLoading || !identityAnswer.trim() || (!identitySelectedQuestion || (identitySelectedQuestion === '__custom__' && !identityCustomQuestion.trim()))}
                                className={`w-full h-[56px] rounded-[16px] font-black text-[16px] transition-all border border-transparent ${identityAnswer.trim() && (identitySelectedQuestion && (identitySelectedQuestion !== '__custom__' || identityCustomQuestion.trim())) && !isLoading ? 'bg-amber-500 hover:bg-amber-600 text-black hover:scale-[1.01] hover:ring-4 hover:ring-amber-500/30 shadow-xl shadow-amber-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Continue'}
                            </Button>

                            <div className="bg-[#1A1A1B] border border-white/10 rounded-[12px] p-3 flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-gray-400 text-[11px]">Select the same security question you chose when creating your account. If you wrote your own, choose the custom option. The answer is case-insensitive.</p>
                            </div>

                            <div className="text-center">
                                <button onClick={() => { setView('twoFAVerify'); setAuthError(''); setAuthSuccess(''); setIdentityAnswer(''); setIdentitySelectedQuestion(''); setIdentityCustomQuestion(''); }} className="text-gray-500 text-[13px] hover:text-white transition-colors">
                                    ← Back to verification
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-1">
                                <h2 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight leading-tight">Create Account</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Full Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">User ID <span className="text-gray-500 font-normal">(unique)</span></Label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            value={userId}
                                            onChange={(e) => validateUserId(e.target.value)}
                                            placeholder="UserID must be Unique"
                                            maxLength={20}
                                            className={`pl-12 pr-10 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] transition-all ${
                                                userIdStatus === 'taken' || userIdError ? 'border-red-500 focus:ring-red-500/30' :
                                                userIdStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500/30' :
                                                'focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500'
                                            }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {userIdStatus === 'checking' && <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />}
                                            {userIdStatus === 'available' && <Check className="w-4 h-4 text-emerald-500" />}
                                            {userIdStatus === 'taken' && <X className="w-4 h-4 text-red-500" />}
                                        </div>
                                    </div>
                                    {userIdError && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{userIdError}</p>}
                                    {userIdStatus === 'available' && !userIdError && <p className="text-[10px] text-emerald-500 font-bold mt-1 ml-1">User ID is available ✓</p>}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            value={email}
                                            onChange={(e) => validateEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className={`pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] transition-all ${emailError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
                                        />
                                    </div>
                                    {emailError && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{emailError}</p>}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Phone (Optional)</Label>
                                    <div className="flex gap-2">
                                        <div className="w-[110px] shrink-0">
                                            <Select value={countryCode} onValueChange={setCountryCode}>
                                                <SelectTrigger className="bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all px-3">
                                                    <SelectValue>
                                                        <div className="flex items-center gap-2">
                                                            <span>{COUNTRIES.find(c => c.code === countryCode)?.flag}</span>
                                                            <span>{countryCode}</span>
                                                        </div>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1A1A1B] border-white/10 text-white max-h-[300px]">
                                                    {COUNTRIES.map((country, idx) => (
                                                        <SelectItem key={`${country.code}-${idx}`} value={country.code}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[16px]">{country.flag}</span>
                                                                <span className="font-medium">{country.code}</span>
                                                                <span className="text-gray-500 text-[12px]">{country.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="relative group flex-1">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <Input
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Phone number"
                                                className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Date of Birth</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="relative group">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10" />
                                                <Input
                                                    placeholder="DD-MM-YYYY"
                                                    value={dateInput}
                                                    onChange={(e) => handleDateChange(e.target.value)}
                                                    className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-md transition-colors"
                                                >
                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0 bg-[#0F0F10] border-white/10 z-[100] shadow-2xl rounded-[20px]"
                                            align="center"
                                            side="bottom"
                                            sideOffset={10}
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={birthDate}
                                                onSelect={(date) => {
                                                    setBirthDate(date);
                                                }}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                                captionLayout="dropdown-buttons"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                                className="bg-[#0F0F10] text-white p-4"
                                                classNames={{
                                                    caption_dropdowns: "flex justify-center gap-2 mb-4",
                                                    dropdown: "bg-[#1A1A1B] border border-white/10 rounded-lg px-2 py-1 text-[12px] font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:border-blue-500/30 transition-all",
                                                    vhidden: "hidden",
                                                    caption_label: "hidden",
                                                    nav: "flex items-center gap-1",
                                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-white/5 rounded-md",
                                                    day_selected: "bg-blue-600 text-white hover:bg-blue-500 rounded-lg font-bold",
                                                    day_today: "bg-white/10 text-white rounded-lg",
                                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/5 rounded-lg transition-colors",
                                                    head_cell: "text-gray-500 rounded-md w-9 font-medium text-[0.8rem] uppercase",
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Gender</Label>
                                    <Select value={gender} onValueChange={setGender}>
                                        <SelectTrigger className="bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-gray-500" />
                                                <SelectValue placeholder="Select Gender" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1B] border-white/10 text-white border-white/10">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                calculateStrength(e.target.value);
                                            }}
                                            placeholder="••••••••"
                                            className="pl-12 pr-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Confirm Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm"
                                            className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2 col-span-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Security Question <span className="text-gray-500 font-normal">(for account recovery)</span></Label>
                                    <Select value={securityQuestion} onValueChange={(val) => { setSecurityQuestion(val); if (val !== '__custom__') setCustomSecurityQuestion(''); }}>
                                        <SelectTrigger className="bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
                                                <SelectValue placeholder="Choose or write your own question" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1B] border-white/10 text-white">
                                            {SECURITY_QUESTIONS.map((q) => (
                                                <SelectItem key={q} value={q}>{q}</SelectItem>
                                            ))}
                                            <SelectItem value="__custom__">✏️ Write my own question...</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {securityQuestion === '__custom__' && (
                                        <div className="relative group mt-2">
                                            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                                            <Input
                                                value={customSecurityQuestion}
                                                onChange={(e) => setCustomSecurityQuestion(e.target.value)}
                                                placeholder="Type your own security question"
                                                maxLength={120}
                                                autoFocus
                                                className="pl-12 bg-[#1A1A1B] border-blue-500/40 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2 col-span-2">
                                    <Label className="text-white font-semibold text-[13px] ml-1">Security Answer <span className="text-gray-500 font-normal">(kept private — used to recover your account)</span></Label>
                                    <div className="relative group">
                                        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <Input
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            placeholder="Your answer to the question above"
                                            className="pl-12 bg-[#1A1A1B] border-white/5 text-white rounded-[12px] h-[48px] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Recovery reminder tip */}
                                <div className="col-span-2 bg-amber-500/8 border border-amber-500/25 rounded-[14px] px-4 py-3 flex gap-3 items-start">
                                    <span className="text-amber-400 text-[16px] mt-0.5 shrink-0">⚠️</span>
                                    <div className="space-y-1">
                                        <p className="text-amber-300 font-bold text-[12px]">Remember these for account recovery</p>
                                        <ul className="text-amber-200/70 text-[11px] space-y-0.5 list-none">
                                            <li>• Your <span className="text-white font-semibold">User ID</span> — required to start the recovery process</li>
                                            <li>• Your <span className="text-white font-semibold">security question</span> — especially if you wrote a custom one</li>
                                            <li>• Your <span className="text-white font-semibold">security answer</span> — exact wording matters (case-insensitive)</li>
                                        </ul>
                                        <p className="text-amber-200/50 text-[10px] pt-0.5">Consider writing these down somewhere safe.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Strength Box */}
                            <div className="bg-[#050505]/80 rounded-[20px] p-4 sm:p-5 border border-white/5">
                                <div className="flex justify-between items-center mb-3 sm:mb-4">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">Security Strength</span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${strength <= 20 ? 'text-red-500' :
                                        strength <= 60 ? 'text-yellow-500' :
                                            'text-emerald-500'
                                        }`}>
                                        {strengthLabel}
                                    </span>
                                </div>

                                {/* 5-bar Strength Indicator */}
                                <div className="flex gap-2 mb-4 sm:mb-5">
                                    {[20, 40, 60, 80, 100].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${strength >= step ? strengthColor : 'bg-white/5'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    {[
                                        { label: '8+ Chars', met: password.length >= 8 },
                                        { label: 'Uppercase', met: /[A-Z]/.test(password) },
                                        { label: 'Lowercase', met: /[a-z]/.test(password) },
                                        { label: 'Number', met: /[0-9]/.test(password) },
                                        { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) },
                                    ].map((rule) => (
                                        <div key={rule.label} className="flex items-center gap-1.5 grayscale-[0.5] hover:grayscale-0 transition-all">
                                            <div className={`w-[14px] h-[14px] rounded-full flex items-center justify-center border ${rule.met ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-transparent'
                                                }`}>
                                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-tight ${rule.met ? 'text-emerald-500' : 'text-gray-500'}`}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(authError && view === 'register') && (
                                <p className="text-red-400 text-[13px] text-center font-medium bg-red-500/10 rounded-[12px] px-4 py-2">{authError}</p>
                            )}

                            <Button
                                onClick={handleSignUp}
                                disabled={isLoading || strength < 100 || !!emailError || userIdStatus !== 'available' || !securityQuestion || (securityQuestion === '__custom__' && !customSecurityQuestion.trim()) || !securityAnswer.trim()}
                                className={`w-full h-[52px] sm:h-[56px] rounded-[16px] font-black text-[16px] transition-all transform border border-transparent ${
                                    (strength === 100 && !emailError && userIdStatus === 'available' && securityQuestion && (securityQuestion !== '__custom__' || customSecurityQuestion.trim()) && securityAnswer.trim() && !isLoading)
                                        ? 'bg-[#2563EB] hover:bg-blue-600 text-white hover:scale-[1.01] hover:ring-4 hover:ring-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] shadow-xl shadow-blue-500/20'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed grayscale'
                                    }`}
                            >
                                {isLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    : strength === 100 && !emailError && userIdStatus === 'available' && securityQuestion && (securityQuestion !== '__custom__' || customSecurityQuestion.trim()) && securityAnswer.trim() ? 'Create Secure Account' : emailError ? 'Check Email' : userIdStatus === 'taken' ? 'User ID Taken' : userIdStatus === 'checking' ? 'Checking User ID...' : !userId ? 'Enter User ID' : !securityQuestion ? 'Choose Security Question' : (securityQuestion === '__custom__' && !customSecurityQuestion.trim()) ? 'Enter Your Question' : !securityAnswer.trim() ? 'Enter Security Answer' : 'Complete Requirements'
                                }
                            </Button>

                            <div className="text-center">
                                <p className="text-gray-400 text-[14px]">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setView('login')}
                                        className="text-blue-500 font-bold hover:underline"
                                    >
                                        Sign In
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
