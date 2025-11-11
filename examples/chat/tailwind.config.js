/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nic: {
          primary: {
            dark: '#181818',
            light: '#DEDEDE',
          },
          secondary: {
            dark: '#212121',
            light: '#FFFFFF',
          },
          accent: {
            dark: '#3D95DF',
            light: '#3D95DF',
          },
          text: {
            primary: {
              dark: '#DEDEDE',
              light: '#181818',
            },
            secondary: {
              dark: '#FFFFFF',
              light: '#212121',
            },
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      typography: {
        chat: {
          css: {
            fontSize: '1rem',        // 16px base
            lineHeight: '1.75',      // 28px (1.75 * 16)
            maxWidth: '65ch',
            color: 'inherit',        // Herda a cor do parent
            p: {
              marginTop: '1.25em',   // 20px
              marginBottom: '1.25em',
            },
            h1: {
              fontSize: '2.25em',    // 36px
              lineHeight: '1.111',   // 40px
              marginTop: '0',
              marginBottom: '0.889em', // 32px
              fontWeight: '800',
              color: 'inherit',
            },
            h2: {
              fontSize: '1.5em',     // 24px
              lineHeight: '1.333',   // 32px
              marginTop: '2em',      // 48px
              marginBottom: '1em',   // 24px
              fontWeight: '700',
              color: 'inherit',
            },
            h3: {
              fontSize: '1.25em',    // 20px
              lineHeight: '1.6',     // 32px
              marginTop: '1.6em',    // 32px
              marginBottom: '0.6em', // 12px
              fontWeight: '600',
              color: 'inherit',
            },
            h4: {
              marginTop: '1.5em',    // 24px
              marginBottom: '0.5em', // 8px
              lineHeight: '1.5',     // 24px
              fontWeight: '600',
              color: 'inherit',
            },
            code: {
              fontSize: '0.875em',   // 14px
              fontWeight: '600',
              color: 'inherit',
            },
            'code::before': {
              content: '"`"',
            },
            'code::after': {
              content: '"`"',
            },
            pre: {
              fontSize: '0.875em',   // 14px
              lineHeight: '1.714',   // 24px
              borderRadius: '0.375rem', // 6px
              paddingTop: '0.857em',    // 12px
              paddingBottom: '0.857em',
              paddingLeft: '1.143em',   // 16px
              paddingRight: '1.143em',
              marginTop: '1.714em',     // 24px
              marginBottom: '1.714em',
            },
            'pre code': {
              fontSize: 'inherit',
              fontWeight: '400',
            },
            'pre code::before': {
              content: 'none',
            },
            'pre code::after': {
              content: 'none',
            },
            ul: {
              marginTop: '1.25em',   // 20px
              marginBottom: '1.25em',
              paddingLeft: '1.625em', // 26px
            },
            ol: {
              marginTop: '1.25em',   // 20px
              marginBottom: '1.25em',
              paddingLeft: '1.625em', // 26px
            },
            li: {
              marginTop: '0.5em',    // 8px
              marginBottom: '0.5em',
            },
            strong: {
              fontWeight: '600',
              color: 'inherit',
            },
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              marginTop: '2em',      // 32px
              marginBottom: '2em',
              paddingLeft: '1.25em', // 20px
              color: 'inherit',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
