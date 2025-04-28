// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: { max: 3 },
          multiline: { max: 1 },
        }],
      "vue/singleline-html-element-content-newline": "off",
      "vue/valid-v-for": "off",
      "vue/attribute-hyphenation": ["error", "always", {
        ignore: [],
        ignoreTags: ["KonvaText", "KonvaRect"],
      }],
    },
  },
);
