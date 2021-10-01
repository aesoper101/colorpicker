module.exports = {
  purge: {
    enable: process.env.NODE_ENV === "production", // 是否删除未使用的样式
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"], // 指定模板
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        xs: { max: "575px" },
        sm: { min: "576px", max: "767px" },
        md: { min: "768px", max: "991px" },
        lg: { min: "992px", max: "1199px" },
        xl: { min: "1200px", max: "1599px" },
        xxl: { min: "1600px" },
      },
      boxShadow: {
        card: "0 3px 15px 0 rgba(106, 112, 120, 0.1)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp"), require("@tailwindcss/aspect-ratio")],
};
