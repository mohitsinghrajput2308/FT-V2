import { useState } from 'react';
import { User, Mail, Phone, Briefcase, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

const Profile = () => {
    const { currentUser, updateProfile, changePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        occupation: currentUser?.occupation || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await updateProfile(formData);
        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setPasswordErrors(newErrors);
            return;
        }

        setPasswordLoading(true);
        const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordLoading(false);

        if (result.success) {
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordErrors({});
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <Card className="lg:col-span-1">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-4xl font-bold text-white">
                                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                            {currentUser?.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Member since {new Date(currentUser?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </Card>

                {/* Profile Form */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                disabled
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                icon={Phone}
                            />
                            <Input
                                label="Occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                icon={Briefcase}
                            />
                        </div>
                        <Button type="submit" loading={loading} icon={Save}>
                            Save Changes
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Change Password */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Change Password
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <Input
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.currentPassword}
                    />
                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.newPassword}
                    />
                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        error={passwordErrors.confirmPassword}
                    />
                    <Button type="submit" loading={passwordLoading}>
                        Update Password
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Profile;
