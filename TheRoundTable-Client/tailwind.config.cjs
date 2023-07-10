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
        info: "#d4a373",
        success: "#edd892",
        warning: "#ffcb69",
        error: "#adc178"
      },
      Stigander: {
        primary: "#6a994e",
        secondary: "#386641",
        accent: "#bc4749",
        neutral: "#f2e8cf",
        "base-100": "#a7c957",
        info: "#d4a373",
        success: "#edd892",
        warning: "#ffcb69",
        error: "#adc178"
      },
      Malarie: {
        primary: "#e9724c",
        secondary: "#c5283d",
        accent: "#9667e0",
        neutral: "#ffe6e8",
        "base-100": "#ffc857",
        info: "#9b72cf",
        success: "#af99ff",
        warning: "#ff99b6",
        error: "#ffc2e2"
      },
      Bojack: {
        primary: "#341671",
        secondary: "#11001c",
        accent: "#32004f",
        neutral: "#f2e8cf",
        "base-100": "#a480f2",
        info: "#aaaaaa",
        success: "#cccccc",
        warning: "#888888",
        error: "#dddddd"
      },
      Zaris: {
        primary: "#ced4da",
        secondary: "#343a40",
        accent: "#1e1e1e",
        neutral: "#ffffff",
        "base-100": "#e9ecef",
        info: "#ffc9c9",
        success: "#ffd8a8",
        warning: "#eeffaa",
        error: "#d0bfff"
      },
    },
    "retro",
    "dracula",
    "aqua",
    "cyberpunk",
    "coffee"
  ]
};

