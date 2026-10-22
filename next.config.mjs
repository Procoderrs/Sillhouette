/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	experimental: {
		agentFeedback: true,
	},
	cacheComponents: false,
	partialPrefetching: false,
	reactCompiler: true,
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;
