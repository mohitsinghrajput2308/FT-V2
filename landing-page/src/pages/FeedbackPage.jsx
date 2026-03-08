import React from 'react';
import { Navbar } from '../components/Navbar';
import { ReviewSection } from '../components/ReviewSection';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';

const FeedbackPage = () => {
    const { modalState, closeModal } = useAuthModal();

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            <Navbar />
            <div className="pt-28">
                <ReviewSection />
            </div>
            <Footer />
            <AuthModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                initialView={modalState.view}
            />
        </div>
    );
};

export default FeedbackPage;
