import "@tensorflow/tfjs";
const qna = require("@tensorflow-models/qna");
console.log('This is the background page.');
const sendMessageToPopup = (message) => {
	console.log("Send msg to popup:", message);
	chrome.runtime.sendMessage(message);
};
const sendMessageToContent = (message) => {
	chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
		const activeTab = tabs[0];
		if (activeTab) {
			console.log("Send msg to content:", message);
			chrome.tabs.sendMessage(activeTab.id, message);
		} else {
			console.log("Unable to send msg, no active tab:", message);
		}
	});
};
const handleAnswer = (model, msg) => {
    
	model
		.findAnswers(msg.question, msg.context)
		.then((answers) => {
            
			sendMessageToContent({
				type: "QUESTION_RESULT",
				question: msg,
				answers: answers,
			});
            console.log(msg,answers);
		})
		.catch((error) => {
			sendMessageToContent({
				type: "QUESTION_RESULT",
				question: msg,
				answers: [],
				error: error,
			});
            console.log(error);
		});

	return true;
};
qna.load().then((model) => {
	window.__qna_model = model;
	sendMessageToPopup({
		type: "MODEL_LOADED",
	});
	console.log("Model loaded");
});
chrome.runtime.onMessage.addListener((msg, sender, callback) => {
	console.log("recieve msg:", msg);
	switch (msg.type) {
		case "POPUP_LOADED":
			// If model is loaded, respond with a "model loaded"
			// message. Otherwise, wait for the model to load.
			if (window.__qna_model) {
				sendMessageToPopup({
					type: "MODEL_LOADED",
				});
			}
			break;
		case "QUESTION":
			if (!window.__qna_model) {
				sendMessageToContent({
					type: "QUESTION_ERROR",
					question: msg,
					answers: [],
					error: "Model not loaded",
				});
			} else {
				handleAnswer(window.__qna_model, msg, callback);
			}
            break;
		default:
			console.error("Did not recognize message type: ", msg);
			return true;
	}
});