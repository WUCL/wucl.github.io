// eslint.config.mjs — ESLint v9 Flat Config (ESM)
export default [
  // 忽略清單（取代 .eslintignore）
  {
    ignores: [
      "node_modules/**",
      "public/**",
      "dist/**",
      "**/*.min.js"
    ]
  },

  // 規則設定
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "script",
      globals: {
        // Browser DOM
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        URLSearchParams: "readonly",
        NodeFilter: "readonly",
        Element: "readonly",
        fetch: "readonly",
        console: "readonly",

        // jQuery 與你的全域命名空間/工具
        "$": "readonly",
        jQuery: "readonly",
        APP: "readonly",
        TPL: "readonly",
        liff: "readonly",
        deviceObj: "readonly",
        isMobile: "readonly"
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      "no-undef": "error",
      "no-console": "off",
      "eqeqeq": ["warn", "smart"],
      "curly": ["warn", "multi-line"],

      // 允許 _ 或 $ 開頭的未使用變數（常見於 jQuery）
      "no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_|^\\$",
        "varsIgnorePattern": "^_|^\\$"
      }],

      // 若未來想強制不用 var 再開
      "no-var": "off"
    }
  }
];