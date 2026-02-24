/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                'vote-bounce': {
                    '0%': { transform: 'scale(1)' },
                    '30%': { transform: 'scale(0.9)' },
                    '60%': { transform: 'scale(1.08)' },
                    '100%': { transform: 'scale(1)' },
                },
                'vote-ring-pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
                },
                'check-pop': {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'fade-slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'number-reveal': {
                    '0%': { transform: 'scale(0.3) rotateY(90deg)', opacity: '0' },
                    '60%': { transform: 'scale(1.1) rotateY(-10deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' },
                },
            },
            animation: {
                'vote-bounce': 'vote-bounce 0.35s ease-out',
                'vote-ring-pulse': 'vote-ring-pulse 0.6s ease-out',
                'check-pop': 'check-pop 0.4s ease-out',
                'fade-slide-up': 'fade-slide-up 0.4s ease-out',
                'number-reveal': 'number-reveal 0.5s ease-out',
            },
        },
    },
    plugins: [],
};
