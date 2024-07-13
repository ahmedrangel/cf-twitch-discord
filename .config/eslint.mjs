export default [{
  files: ["**/*.js"],
  ignores: [
    "node_modules/**/*",
    ".wrangler/**/*"
  ],
  rules: {
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "linebreak-style": ["error", process.platform === "win32" ? "windows" : "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "camelcase": "off",
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "no-console": ["off"],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "no-multi-spaces": "error",
    "space-before-blocks": "error",
    "no-trailing-spaces": "error",
  }
}]