/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: token("page"),
        panel: token("panel"),
        "panel-hover": token("panel-hover"),
        border: token("border"),
        "border-hover": token("border-hover"),
        fg: token("fg"),
        muted: token("muted"),
        gain: token("gain"),
        loss: token("loss"),
        accent: token("accent"),
      },
    },
  },
  plugins: [],
};
