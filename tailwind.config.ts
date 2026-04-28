import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1320px'
			}
		},
		extend: {
			fontFamily: {
				display: ['"Bricolage Grotesque"', '"Inter Display"', 'system-ui', 'sans-serif'],
				sans:    ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
				mono:    ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
			},
			fontSize: {
				'display-2xl': ['clamp(4rem, 9vw, 8rem)',   { lineHeight: '0.96', letterSpacing: '-0.045em', fontWeight: '500' }],
				'display-xl':  ['clamp(3rem, 6vw, 5rem)',   { lineHeight: '1.0',  letterSpacing: '-0.04em',  fontWeight: '500' }],
				'display-lg':  ['3.052rem',                  { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '500' }],
				'heading':     ['1.953rem',                  { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '500' }],
				'caption':     ['0.75rem',                   { lineHeight: '1.4',  letterSpacing: '0.14em',   fontWeight: '500' }],
			},
			letterSpacing: {
				tightest: '-0.045em',
				tighter:  '-0.035em',
				display:  '-0.025em',
				body:     '-0.01em',
				caption:  '0.14em',
			},
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				canvas: 'hsl(var(--background))',
				ink: 'hsl(var(--foreground))',
				jade: {
					DEFAULT: 'hsl(var(--accent-jade))',
					soft: 'hsl(var(--accent-jade) / 0.6)',
				},
				surface: {
					1: 'hsl(var(--surface-1))',
					2: 'hsl(var(--surface-2))',
					3: 'hsl(var(--surface-3))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Legacy "Jurassic" tokens — remapped to jade so existing pages
				// (bg-amber, text-amber, etc.) inherit the new identity.
				amber: {
					DEFAULT: 'hsl(var(--amber))',
					glow: 'hsl(var(--amber-glow))'
				},
				'forest-green': {
					DEFAULT: 'hsl(var(--forest-green))',
					dark: 'hsl(var(--forest-green-dark))'
				},
				'earth-brown': 'hsl(var(--earth-brown))',
				'fossil-gray': 'hsl(var(--fossil-gray))'
			},
			backgroundImage: {
				'gradient-amber': 'var(--gradient-amber)',
				'gradient-forest': 'var(--gradient-forest)',
				'gradient-prehistoric': 'var(--gradient-prehistoric)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-subtle': 'var(--gradient-subtle)',
			},
			boxShadow: {
				'amber': 'var(--shadow-amber)',
				'glow':  'var(--shadow-glow)',
				'fossil': 'var(--shadow-fossil)',
				'ring':  'var(--shadow-ring)',
				'editorial': '0 0 0 1px hsl(var(--foreground) / 0.08), 0 30px 60px -30px hsl(0 0% 0% / 0.7)',
			},
			borderRadius: {
				'2xl': 'var(--radius-xl)',
				'3xl': 'var(--radius-2xl)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transitionTimingFunction: {
				spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
				soft:   'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			transitionDuration: {
				400: '400ms',
				600: '600ms',
				800: '800ms',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to:   { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to:   { height: '0' }
				},
				'fade-rise': {
					from: { opacity: '0', transform: 'translateY(24px)' },
					to:   { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up':   'accordion-up 0.2s ease-out',
				'fade-rise':      'fade-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
