/**
 * Google AdSense Ad Component
 * Replace data-ad-client and data-ad-slot with your actual values
 */

import { useEffect, useRef } from 'react';

export default function AdBanner({
    adSlot = "XXXXXXXXXX",
    adFormat = "auto",
    fullWidth = true,
    className = ""
}) {
    const adRef = useRef(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className={`ad-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidth ? "true" : "false"}
                ref={adRef}
            />
        </div>
    );
}

// Usage example:
// <AdBanner adSlot="1234567890" />
