/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,ts,jsx,tsx}'];
export const plugins = [require("daisyui")];
export const daisyui = {
  themes: [
    {
      Stigander: {
        // green
        primary: "#6a994e",
        // darker green
        secondary: "#386641",
        // red
        accent: "#bc4749",
        // cream / parchment / off white
        neutral: "#f2e8cf",
        // lighter green
        "base-100": "#a7c957",
        // orange
        info: "#f4a259",
        // yellow
        success: "#f4e285",
        // another green
        warning: "#8cb369",
        // a blueish green
        error: "#5b8e7d"
      },
      Malarie: {
        // orange
        primary: "#e9724c",
        // red
        secondary: "#c5283d",
        // "yellow"
        "alt-secondary": "#ffc857",
        // purple
        accent: "#9667e0",
        // cream / parchment / off white
        neutral: "#ffe6e8",
        // lighter green
        "base-100": "#ffc857",
        // dark purple
        info: "#9b72cf",
        // lavender
        success: "#af99ff",
        // pink
        warning: "#ff99b6",
        // light pink
        error: "#ffc2e2"
      },
      Bojack: {
        // grimmace purple
        primary: "#341671",
        // midnight purple
        secondary: "#11001c",
        // grape purple
        accent: "#32004f",
        // cream / parchment / off white
        neutral: "#f2e8cf",
        // lavendar
        "base-100": "#a480f2",
        // grey 2
        info: "#aaaaaa",
        // grey 1
        success: "#cccccc",
        // grey 3
        warning: "#888888",
        // grey 4
        error: "#444444"
      },
      Zaris: {
        // green
        primary: "#ced4da",
        // darker green
        secondary: "#343a40",
        // black
        accent: "#1e1e1e",
        // white
        neutral: "#ffffff",
        // off white
        "base-100": "#e9ecef",
        // red
        info: "#ffc9c9",
        // orange
        success: "#ffd8a8",
        // yellow
        warning: "#eeffaa",
        // purple
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

