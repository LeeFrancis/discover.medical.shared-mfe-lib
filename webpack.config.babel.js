import path from "path";
import CleanWebpackPlugin from "clean-webpack-plugin";
const nodeExternals = require("webpack-node-externals");

const packageJson = require("./package.json");

export default () => ({
  mode: "production",
  target: "node", // in order to ignore built-in modules like path, fs, etc.
  entry: {
    index: path.join(__dirname, "src/index.js")
  },
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: packageJson.name,
    libraryTarget: "umd",
    globalObject: "this"
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: path.join(__dirname, "src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
          }
        ]
      },
      {
        test: /\.(scss)$/,
        loader: "style-loader!css-loader!sass-loader"
      }
    ]
  },

  resolve: {
    extensions: [".js", ".jsx", ".scss"]
  },

  plugins: [new CleanWebpackPlugin(["dist/*.*"])],
  optimization: {
    splitChunks: {
      name: "vendor",
      minChunks: 2
    }
  }
});
