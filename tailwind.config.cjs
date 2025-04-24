/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cosmic Color Palette
        'void': '#000817',
        'stardust': '#7af8ff',
        'nebula': '#2a4b8d',
        'singularity': '#183055',
        'quantum': '#4a2f8d',
        'plasma': '#ff4d7a',
        'event-horizon': '#31639e',
        'dark-matter': '#0a1025'
      },
      fontFamily: {
        'rpg-body': ['"Space Mono"', 'monospace'],
        'rpg-heading': ['Orbitron', 'sans-serif'],
        'rpg-console': ['"Press Start 2P"', 'cursive']
      },
      animation: {
        // Mystical Animations
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pixel-glitch': 'pixel-glitch 0.5s infinite',
        'shield-bubble': 'shield-bubble 4s linear infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 'text-shadow': '0 0 10px rgba(122, 248, 255, 0.4)' },
          '50%': { 'text-shadow': '0 0 20px rgba(122, 248, 255, 0.8)' }
        },
        'pixel-glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
          '100%': { transform: 'translate(0)' }
        },
        'shield-bubble': {
          '0%': { 'box-shadow': '0 0 10px #7af8ff' },
          '50%': { 'box-shadow': '0 0 30px #7af8ff' },
          '100%': { 'box-shadow': '0 0 10px #7af8ff' }
        }
      },
      boxShadow: {
        // Holographic Effects
        'hologram': '0 0 20px rgba(122, 248, 255, 0.3)',
        'hologram-md': '0 0 30px rgba(122, 248, 255, 0.4)',
        'hologram-lg': '0 0 40px rgba(122, 248, 255, 0.5)'
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      // Main utilities
      const newUtilities = {
        '.rpg-text': {
          'text-shadow': '0 0 8px rgba(122, 248, 255, 0.7)',
          'letter-spacing': '0.1em'
        },
        '.rpg-border': {
          'border': '1px solid rgba(122, 248, 255, 0.3)',
          'box-shadow': '0 0 15px rgba(122, 248, 255, 0.2)'
        },
        '.retro-text': {
          'text-shadow': '2px 2px 0 #000, -1px -1px 0 #000'
        },
        '.crt-effect': {
          'position': 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            'z-index': '2',
            'background-size': '100% 2px',
            'pointer-events': 'none'
          }
        }
      };
      
      // Hologram utilities with hover variants
      const hologramUtilities = {
        '.hologram': {
          'box-shadow': '0 0 20px rgba(122, 248, 255, 0.3)'
        },
        '.hologram-md': {
          'box-shadow': '0 0 30px rgba(122, 248, 255, 0.4)'
        },
        '.hologram-lg': {
          'box-shadow': '0 0 40px rgba(122, 248, 255, 0.5)'
        }
      };

      // Add utilities with proper variants
      addUtilities(newUtilities, {
        variants: ['responsive', 'hover']
      });
      
      addUtilities(hologramUtilities, {
        variants: ['responsive', 'hover']
      });
    }
  ]
}