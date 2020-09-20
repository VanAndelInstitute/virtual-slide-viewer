/* eslint-disable no-undef */
module.exports = {
  "extends": "@snowpack/app-scripts-react",
  "plugins": [
    ["@snowpack/plugin-run-script", {
      "cmd": "eslint 'src/**/*.{js,jsx,ts,tsx}'",
      // Optional: Use npm package "watch" to run on every file change
      "watch": "watch \"$1\" src"
    }],
    ["@snowpack/plugin-optimize", { }]
  ],
  "buildOptions": {
    "clean": true,
    "minify": false
  },
  "mount": {
    'src/ImageView': '/viewer',
    'src/DataView': '/',
  },
  "installOptions": {
    "sourceMap": true
  }
}
