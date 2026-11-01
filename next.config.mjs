/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	experimental: {
		agentFeedback: true,
	},
	cacheComponents: false,
	partialPrefetching: false,
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
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
