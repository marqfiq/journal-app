module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html,css}',
  ],
  // Safelist classes that are only referenced inside CSS via @apply
  safelist: [
    // blur / glass
    'backdrop-blur-xl',
    'backdrop-blur-md',
    // alpha colors used with slash syntax
    'bg-white/10',
    'bg-white/30',
    'border-white/20',
    // text colors
    'text-gray-800',
    'text-gray-400',
    // spacing & typography utilities
    'mb-4',
    'mb-3',
    'mb-2',
    'mt-6',
    'mt-5',
    'mt-4',
    'leading-7',
    'text-3xl',
    'text-2xl',
    'text-xl',
    'pl-6',
    'px-1',
    'py-0.5',
    'rounded',
    'rounded-lg',
    'p-4',
    'prose',
    'prose-lg',
    'max-w-full',
    'h-auto',
    'overflow-x-auto',
    'outline-none',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
