const validateSender = (message, sender) => {
	// eslint-disable-next-line no-undef
	return sender.id === chrome.runtime.id && message.from === "react-app";
};

const messagesFromReactAppListener = (message, sender, response) => {
	const isValidated = validateSender(message, sender);

	if (isValidated && message.message === "all-text") {
		var text=document.querySelector("body").innerText;
        response(text);
	}

	if (isValidated && message.message === "delete logo") {
		const but = document.querySelector(".VfPpkd-Bz112c-LgbsSe");
		but?.click();
	}
};

const main = () => {
	console.log("[content.js] Main");
	/**
	 * Fired when a message is sent from either an extension process or a content script.
	 */
	// eslint-disable-next-line no-undef
	chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
};
// eslint-disable-next-line no-undef
main();
