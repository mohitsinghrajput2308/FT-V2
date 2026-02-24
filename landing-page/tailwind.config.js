/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				50: '#eff6ff',
  				100: '#dbeafe',
  				200: '#bfdbfe',
  				300: '#93c5fd',
  				400: '#60a5fa',
  				500: '#3b82f6',
  				600: '#2563eb',
  				700: '#1d4ed8',
  				800: '#1e40af',
  				900: '#1e3a8a',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Dashboard colors
  			success: {
  				50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
  				400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
  				800: '#065f46', 900: '#064e3b',
  			},
  			warning: {
  				50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
  				400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
  				800: '#92400e', 900: '#78350f',
  			},
  			danger: {
  				50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
  				400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
  				800: '#991b1b', 900: '#7f1d1d',
  			},
  			dark: {
  				100: '#1e1e1e', 200: '#2d2d2d', 300: '#3d3d3d', 400: '#4d4d4d',
  				500: '#5d5d5d', 600: '#6d6d6d', 700: '#7d7d7d', 800: '#8d8d8d',
  				900: '#9d9d9d',
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			slideIn: {
  				'0%': { transform: 'translateX(100%)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in': 'slideIn 0.3s ease-out',
  			'fade-in': 'fadeIn 0.3s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};