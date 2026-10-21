// Yahan wo numbers likhein jo video hain. Baqi sab post honge.
const videoIds = [2, 5, 6, 10];

export const instagramItems = Array.from({ length: 12 }, (_, i) => {
	const id = i + 1;
	const isVideo = videoIds.includes(id);

	return {
		id,
		type: isVideo ? "video" : "post",
		poster: isVideo ? `/video-${id}.jpg` : `/insta-${id}.jpg`,
		media: isVideo ? `/video-${id}.mp4` : `/insta-${id}.jpg`,
		caption: `Caption for post ${id}`,
		shopUrl: "https://sillhouete.com/collections/raha-eid-pret26",
		hashtags: "#Sillhouete #luxurypret #formals #festive",
		date: "18 October",
	};
});
