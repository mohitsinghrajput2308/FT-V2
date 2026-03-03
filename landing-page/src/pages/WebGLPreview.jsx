import React from 'react';
import WebGLHero from '../components/WebGLHero';
import { Navbar } from "@/components/Navbar";

const WebGLPreview = () => {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <WebGLHero
                headline={{ line1: "Boldly Go", line2: "Where No Man Has Gone" }}
                subtitle="Explore strange new worlds with our WebGL background."
                trustBadge={{ text: "Trusted by the Universe" }}
                buttons={{
                    primary: { text: "Get Started", onClick: () => alert("Primary Clicked") },
                    secondary: { text: "Learn More", onClick: () => alert("Secondary Clicked") }
                }}
            />
        </div>
    );
};

export default WebGLPreview;
