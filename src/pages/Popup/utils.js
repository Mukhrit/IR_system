export const getCurrentTabUrl = (callback) => {
	const queryInfo = { active: true, lastFocusedWindow: true };

	// eslint-disable-next-line no-undef
	chrome.tabs &&
		// eslint-disable-next-line no-undef
		chrome.tabs.query(queryInfo, (tabs) => {
			callback(tabs[0].url);
		});
};

export const getCurrentTabUId = (callback) => {
	const queryInfo = { active: true, lastFocusedWindow: true };

	chrome.tabs &&
		chrome.tabs.query(queryInfo, (tabs) => {
			callback(tabs[0].id);
		});
};
