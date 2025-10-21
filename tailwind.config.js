/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: {
        // EngineerTax カラーパレット
        primary: "#627962", // アクセントカラー（深緑）
        base: "#F1ECEB", // ベースカラー（オフホワイト）
        text: "#363427", // テキストカラー（ダークグリーン）
        
        // 補助カラー
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        info: "#2196F3",
        
        // 従来のカラー（互換性のため保持）
        accent: "#FE0000",
        sub1: "#B3DBC0",
        sub2: "#FDF6F6",
        background: "#FFFFFF",
        border: "#E0E0E0",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
