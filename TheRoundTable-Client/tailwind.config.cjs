/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,ts,jsx,tsx}'];
export const plugins = [require("daisyui")];
export const daisyui = {
  themes: [
    {
      TheRoundTable: {
        primary: "#aaaaaa",
        secondary: "#39b5f6",
        accent: "#bc4749",
        neutral: "#f2e8cf",
        "base-100": "#dddccc",
        info: "#b91c1c",
        success: "#facc15",
        warning: "#10b981",
        error: "#60a5fa"
      },
      Stigander: {
        primary: "#6a994e",
        secondary: "#386641",
        accent: "#bc4749",
        neutral: "#f2e8cf",
        "base-100": "#a7c957",
        info: "#b91c1c",
        success: "#facc15",
        warning: "#10b981",
        error: "#60a5fa"
      },
      Malarie: {
        primary: "#e9724c",
        secondary: "#c5283d",
        accent: "#9667e0",
        neutral: "#ffe6e8",
        "base-100": "#ffc857",
        info: "#b91c1c",
        success: "#facc15",
        warning: "#10b981",
        error: "#60a5fa"
      },
      Bojack: {
        primary: "#341671",
        secondary: "#11001c",
        accent: "#32004f",
        neutral: "#f2e8cf",
        "base-100": "#a480f2",
        info: "#b91c1c",
        success: "#facc15",
        warning: "#10b981",
        error: "#60a5fa"
      },
      Zaris: {
        primary: "#ced4da",
        secondary: "#343a40",
        accent: "#1e1e1e",
        neutral: "#ffffff",
        "base-100": "#e9ecef",
        info: "#b91c1c",
        success: "#facc15",
        warning: "#10b981",
        error: "#60a5fa"
      },
    }
  ]
};

