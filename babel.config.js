const plugins = [
  ["import", { libraryName: "antd", style: true }, "antd"],

  "babel-plugin-styled-components",
  "lodash",
].filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  plugins.push("react-refresh/babel");
}

module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        development: process.env.NODE_ENV === "development",
      },
    ],
  ],
  plugins,
};
