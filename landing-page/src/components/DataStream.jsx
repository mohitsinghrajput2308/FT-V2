import React, { useEffect, useRef } from 'react';

export const DataStream = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = window.innerHeight;

    const columns = canvas.width / 20;
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const characters = '0123456789$€£¥₿';

    function draw() {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#14b8a6';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * 20, drops[i]);

        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 20;
      }
    }

    const interval = setInterval(draw, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 h-full pointer-events-none opacity-30"
    />
  );
};
