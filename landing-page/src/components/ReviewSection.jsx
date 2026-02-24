import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, Send, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { VIDEO_URLS } from '../config/videos';

const initialReviews = [
    {
        name: "Saurabh Mishra",
        role: "Active Desktop Trader",
        content: "Honestly, I was skeptical about the 3D dashboard at first, but it actually helps me spot spending spikes way faster than a flat spreadsheet. The real-time sync with my HDFC and SBI accounts worked surprisingly well.",
        rating: 5,
        avatar: "SM",
        verified: true
    },
    {
        name: "David K.",
        role: "Freelance Designer",
        content: "The UI is great, but the tax tagging is what kept me. It’s not perfect—sometimes the category AI glitches—but it's still 10x better than manually entering receipts every Friday night. Saved my sanity during tax season.",
        rating: 4,
        avatar: "DK",
        verified: true
    },
    {
        name: "Elena Torres",
        role: "Real Estate Investor",
        content: "Finally a tool that doesn't feel like a toy. I manage 12 different properties and seeing the cash flow visualized in that dark 'pro' mode is just satisfying. A bit pricey for the top tier, but worth it for the security.",
        rating: 5,
        avatar: "ET",
        verified: true
    }
];

export const ReviewSection = () => {
    const [reviews, setReviews] = useState(initialReviews);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const videoRef = useRef(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        rating: 5,
        content: ''
    });
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setIsVideoReady(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.username || !formData.content) return;

        const newReview = {
            name: formData.username,
            role: "Verified User",
            content: formData.content,
            rating: formData.rating,
            avatar: formData.username.substring(0, 2).toUpperCase(),
            isNew: true
        };

        setReviews([newReview, ...reviews]);
        setFormData({ username: '', email: '', rating: 5, content: '' });
    };

    return (
        <section className="py-24 bg-[#0A0A0B] relative overflow-hidden transition-colors duration-1000">
            {/* Cinematic Video Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Shutter Layer (Fades Out) */}
                <div
                    className={`absolute inset-0 bg-black z-10 transition-opacity duration-[1500ms] ease-in-out pointer-events-none ${isVideoReady ? 'opacity-60' : 'opacity-100'
                        }`}
                />

                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onPlaying={() => setIsVideoReady(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoReady ? 'opacity-30' : 'opacity-0'
                        }`}
                >
                    <source src={VIDEO_URLS.chipBg} type="video/mp4" />
                </video>

                {/* Global Cinematic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-20 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-20 opacity-40" />

                {/* Micro-Grit/Texture Overlay */}
                <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
                />
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Community <span className="text-blue-500">Feedback</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
                        What our elite users are saying about their FinTrack experience.
                    </p>
                </div>

                {/* Review Submission Form */}
                <div className="max-w-3xl mx-auto mb-24 p-8 bg-white dark:bg-gray-800/20 border border-border rounded-[2.5rem] backdrop-blur-xl shadow-2xl">

                    {/* Centered Star Rating - Above Title */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex space-x-3 bg-gray-50 dark:bg-black/40 p-5 rounded-3xl border border-border w-fit shadow-2xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="transition-transform active:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all duration-300 ${star <= (hoveredRating || formData.rating)
                                            ? 'fill-[#FFD700] text-[#FFD700] [filter:drop-shadow(0_0_15px_rgba(255,215,0,0.4))] scale-110'
                                            : 'text-gray-300 dark:text-gray-800'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-sm font-black text-blue-500 uppercase tracking-[0.5em] mt-4 opacity-90">Rate Your Experience</div>
                    </div>

                    <h3 className="text-3xl font-black text-foreground mb-10 flex items-center gap-4">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                        Share Your Report
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Username</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-black/40 border-2 border-border focus:border-blue-500 rounded-[1.5rem] outline-none transition-all font-bold text-xl text-foreground placeholder:text-gray-600"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email address"
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-black/40 border-2 border-border focus:border-blue-500 rounded-[1.5rem] outline-none transition-all font-bold text-xl text-foreground placeholder:text-gray-600"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="space-y-3">
                            <label className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Your Report</label>
                            <textarea
                                required
                                rows="5"
                                placeholder="Describe your experience with our advanced financial tools..."
                                className="w-full p-6 bg-gray-50 dark:bg-black/40 border-2 border-border focus:border-blue-500 rounded-[1.5rem] outline-none transition-all font-bold text-xl text-foreground placeholder:text-gray-600 resize-none"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                            Submit Report
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>

                {/* Review Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className={`relative group p-8 bg-white dark:bg-gray-800/30 border border-border rounded-[2rem] hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/5 animate-fade-in ${review.isNew ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-background' : ''}`}
                        >
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Quote className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex space-x-1 mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                                ))}
                            </div>

                            <p className="text-xl text-foreground/90 font-medium italic mb-10 leading-relaxed">
                                "{review.content}"
                            </p>

                            <div className="flex items-center space-x-5 border-t border-border pt-8">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg">
                                    {review.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xl font-black text-foreground leading-none">{review.name}</div>
                                        {(review.verified || review.isNew) && (
                                            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="w-3 h-3 text-blue-500" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-blue-500 uppercase tracking-widest">{review.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
