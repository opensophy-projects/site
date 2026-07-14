export type InfinitePhysicsGalleryImageItem = {
	id?: string | number;
	type: "image";
	image: {
		src: string;
		alt?: string;
	};
};

export type InfinitePhysicsGalleryVideoItem = {
	id?: string | number;
	type: "video";
	video: {
		src: string;
	};
};

export type InfinitePhysicsGalleryItem =
	| InfinitePhysicsGalleryImageItem
	| InfinitePhysicsGalleryVideoItem;
