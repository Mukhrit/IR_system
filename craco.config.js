module.exports = {
	webpack: {
		configure: (webpackConfig, { env, paths }) => {
			return {
				...webpackConfig,
				entry: {
					main: [
						env === "development" &&
							require.resolve("react-dev-utils/webpackHotDevClient"),
						paths.appIndexJs,
					].filter(Boolean),
					content: "./src/chrome/content.js",
					background: "./src/chrome/background.js",
				},
				output: {
					...webpackConfig.output,
					filename: "[name].js",
				},
				optimization: {
					...webpackConfig.optimization,
					runtimeChunk: false,
				},
			};
		},
	},
};