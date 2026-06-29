/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
              "surface-container-lowest": "#0c0e12",
              "warning-amber": "#f59e0b",
              "on-primary-container": "#0d0096",
              "on-background": "#e2e2e8",
              "surface-charcoal": "#161b22",
              "primary-fixed": "#e1e0ff",
              "tertiary": "#ffb783",
              "success-emerald": "#10b981",
              "surface-bright": "#37393e",
              "tertiary-fixed-dim": "#ffb783",
              "on-secondary-fixed": "#23005c",
              "primary-container": "#8083ff",
              "surface-container-highest": "#333539",
              "tertiary-container": "#d97721",
              "background": "#111318",
              "on-tertiary-container": "#452000",
              "surface": "#111318",
              "primary": "#c0c1ff",
              "error": "#ffb4ab",
              "surface-tint": "#c0c1ff",
              "surface-dim": "#111318",
              "outline": "#908fa0",
              "on-secondary-fixed-variant": "#5516be",
              "on-secondary-container": "#c4abff",
              "border-glass": "rgba(255, 255, 255, 0.08)",
              "on-surface-variant": "#c7c4d7",
              "on-tertiary": "#4f2500",
              "error-container": "#93000a",
              "primary-fixed-dim": "#c0c1ff",
              "surface-container-high": "#282a2e",
              "on-tertiary-fixed-variant": "#703700",
              "on-primary-fixed": "#07006c",
              "surface-variant": "#333539",
              "on-error-container": "#ffdad6",
              "on-primary": "#1000a9",
              "inverse-on-surface": "#2f3035",
              "on-primary-fixed-variant": "#2f2ebe",
              "surface-container-low": "#1a1c20",
              "surface-container": "#1e2024",
              "secondary-fixed-dim": "#d0bcff",
              "inverse-primary": "#494bd6",
              "secondary-container": "#571bc1",
              "on-secondary": "#3c0091",
              "inverse-surface": "#e2e2e8",
              "on-tertiary-fixed": "#301400",
              "on-surface": "#e2e2e8",
              "surface-glass": "rgba(22, 27, 34, 0.6)",
              "tertiary-fixed": "#ffdcc5",
              "outline-variant": "#464554",
              "secondary": "#d0bcff",
              "secondary-fixed": "#e9ddff",
              "on-error": "#690005"
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "margin-desktop": "40px",
              "margin-mobile": "16px",
              "unit": "4px",
              "gutter": "24px",
              "container-max-width": "1440px"
      },
      "fontFamily": {
              "headline-md": [
                      "Inter"
              ],
              "headline-sm": [
                      "Inter"
              ],
              "display-lg": [
                      "Inter"
              ],
              "body-sm": [
                      "Inter"
              ],
              "label-md": [
                      "Inter"
              ],
              "headline-lg": [
                      "Inter"
              ],
              "body-lg": [
                      "Inter"
              ],
              "label-sm": [
                      "Inter"
              ],
              "body-md": [
                      "Inter"
              ]
      },
      "fontSize": {
              "headline-md": [
                      "24px",
                      {
                              "lineHeight": "32px",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "600"
                      }
              ],
              "headline-sm": [
                      "20px",
                      {
                              "lineHeight": "28px",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "600"
                      }
              ],
              "display-lg": [
                      "48px",
                      {
                              "lineHeight": "56px",
                              "letterSpacing": "-0.04em",
                              "fontWeight": "700"
                      }
              ],
              "body-sm": [
                      "14px",
                      {
                              "lineHeight": "20px",
                              "letterSpacing": "0em",
                              "fontWeight": "400"
                      }
              ],
              "label-md": [
                      "12px",
                      {
                              "lineHeight": "16px",
                              "letterSpacing": "0.05em",
                              "fontWeight": "600"
                      }
              ],
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "40px",
                              "letterSpacing": "-0.03em",
                              "fontWeight": "700"
                      }
              ],
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "28px",
                              "letterSpacing": "0em",
                              "fontWeight": "400"
                      }
              ],
              "label-sm": [
                      "10px",
                      {
                              "lineHeight": "14px",
                              "letterSpacing": "0.05em",
                              "fontWeight": "600"
                      }
              ],
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "24px",
                              "letterSpacing": "0em",
                              "fontWeight": "400"
                      }
              ]
      }
    },
  },
  plugins: [],
}