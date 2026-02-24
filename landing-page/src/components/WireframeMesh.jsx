import React from 'react';

export const WireframeMesh = ({ position = 'top-right', color = 'blue' }) => {
  const colorClasses = {
    blue: 'stroke-blue-400/30',
    teal: 'stroke-teal-400/30',
    cyan: 'stroke-cyan-400/30',
    green: 'stroke-emerald-400/30'
  };

  const positionClasses = {
    'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
    'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
    'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4'
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-96 h-96 pointer-events-none animate-float-slow`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ 
          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))',
          transform: 'perspective(1000px) rotateX(20deg) rotateY(-20deg)'
        }}
      >
        {/* Wireframe mesh pattern */}
        <g className={colorClasses[color]} strokeWidth="1" fill="none">
          {/* Horizontal lines */}
          {[...Array(20)].map((_, i) => {
            const y = (i * 20);
            const curve = Math.sin(i * 0.3) * 30;
            return (
              <path
                key={`h-${i}`}
                d={`M 0,${y} Q 100,${y + curve} 200,${y} T 400,${y}`}
                className="animate-pulse-slow"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            );
          })}
          
          {/* Vertical lines */}
          {[...Array(20)].map((_, i) => {
            const x = (i * 20);
            const curve = Math.cos(i * 0.3) * 30;
            return (
              <path
                key={`v-${i}`}
                d={`M ${x},0 Q ${x + curve},100 ${x},200 T ${x},400`}
                className="animate-pulse-slow"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            );
          })}

          {/* Connecting dots */}
          {[...Array(10)].map((_, i) => {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r="2"
                className="fill-current animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
