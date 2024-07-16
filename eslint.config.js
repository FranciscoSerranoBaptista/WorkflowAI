// eslint.config.js
export default [
  {
    rules: {
      "import-x/no-unresolved": [
        "error",
        {
          ignore: ["^bun(:\\w+)?$"],
        },
      ],
    },
  },
];
