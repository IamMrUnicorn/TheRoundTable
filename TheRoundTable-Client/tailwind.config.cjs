/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,ts,jsx,tsx}'];
export const plugins = [require("daisyui")];
export const daisyui = {
  themes: [
    {
      TheRoundTable: {
        primary: "#963C5E",
        secondary: "#240F17",
        accent: "#B64973",
        neutral: "#F8EDF1",
        "base-100": "#1c021c",
        'neutral-content': "#000",
        info: "#E6A1A1",
        success: "#FAE6A0",
        warning: "#AEDCC4",
        error: "#AED4F3",
      },
      Stigander: {
        primary: "#6a994e",
        secondary: "#386641",
        accent: "#bc4749",
        neutral: "#f2e8cf",
        "base-100": "#a7c957",
        info: "#E6A1A1",
        success: "#FAE6A0",
        warning: "#AEDCC4",
        error: "#AED4F3",
      },
      Malarie: {
        primary: "#e9724c",
        secondary: "#c5283d",
        accent: "#9667e0",
        neutral: "#ffe6e8",
        "base-100": "#ffc857",
        info: "#E6A1A1",
        success: "#FAE6A0",
        warning: "#AEDCC4",
        error: "#AED4F3",
      },
      Bojack: {
        primary: "#341671",
        secondary: "#11001c",
        accent: "#32004f",
        neutral: "#f2e8cf",
        "base-100": "#a480f2",
        info: "#E6A1A1",
        success: "#FAE6A0",
        warning: "#AEDCC4",
        error: "#AED4F3",
      },
      Zaris: {
        primary: "#ced4da",
        secondary: "#343a40",
        accent: "#1e1e1e",
        neutral: "#ffffff",
        "base-100": "#e9ecef",
        info: "#E6A1A1",
        success: "#FAE6A0",
        warning: "#AEDCC4",
        error: "#AED4F3",
      },
    },
  ]
};

export const theme = {
  extend: {
    gridTemplateRows: {
      '7': 'repeat(7, minmax(0, 1fr))',
      '8': 'repeat(8, minmax(0, 1fr))',
      '9': 'repeat(9, minmax(0, 1fr))',
      '10': 'repeat(10, minmax(0, 1fr))',
      '11': 'repeat(11, minmax(0, 1fr))',
      '12': 'repeat(12, minmax(0, 1fr))',
      '40': 'repeat(40, minmax(1rem, 1fr))',
      
    }
  }
};