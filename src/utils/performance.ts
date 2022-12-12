export function lazyCache<T>(getter: () => T): () => T {
	let cached: T | undefined;
	return () => {
		if (cached === undefined) {
			cached = getter();
		}
		return cached;
	};
}

