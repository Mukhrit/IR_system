import {
	DATA_ATTR_ELEMENT_ID,
	DATA_ATTR_SELECTED,
	DATA_ATTR_SUCCESS,
	CLASS_NAME_MARKED,
	CLASS_NAME_MARKED_SCORE,
	MIN_TOKENS,
} from "./constant";
import Mark from "mark.js";
import $ from "jquery";
import { v4 as uuidv4 } from "uuid";

const validateSender = (message, sender) => {
	// eslint-disable-next-line no-undef
	return sender.id === chrome.runtime.id && message.from === "react-app";
};
const findAllElements = () => {
	return $("[" + DATA_ATTR_ELEMENT_ID + "]");
};

const findElementById = (elementId) => {
	const q = $("[" + DATA_ATTR_ELEMENT_ID + "=" + elementId + "]");
	return q.length > 0 ? $(q[0]) : null;
};
const messagesFromReactAppListener = (message, sender, response) => {
	const isValidated = validateSender(message, sender);

	if (isValidated && message.message === "all-text") {
		var text = document.querySelector("body").innerText;
		response(text);
	}

	if (isValidated && message.message === "delete logo") {
		const but = document.querySelector(".VfPpkd-Bz112c-LgbsSe");
		but?.click();
	}
};
const searchableElement = (idx, el) => {
	const validToken = (token) => {
		if (!token) {
			return false;
		}

		const alphaNum = token.match(/[a-zA-Z0-9]/g);
		return alphaNum && alphaNum.length > 0;
	};

	// Split by spaces, remove tokens without alphanumeric characters.
	const tokens = $(el).text().split(" ").filter(validToken);
	return tokens.length > MIN_TOKENS;
};
const checkIfQueryDone = () => {
	const allElements = findAllElements();
	const waitingElements = allElements.filter((idx, node) => {
		return $(node).attr(DATA_ATTR_SUCCESS) === undefined;
	});
	console.log("Check Query");
	if (waitingElements.length === 0) {
		console.log("Query done");
		chrome.runtime.sendMessage({
			type: "QUERY_DONE",
		});
	}
};
const handleModelSuccess = (msg) => {
		// Mark question on dom.
		const element = findElementById(msg.question.elementId);
		element.attr(DATA_ATTR_SUCCESS, "true");
		for (const answer of msg.answers) {
			chrome.runtime.sendMessage({
				type: "QUERY_RESULT",
				answer: answer,
				elementId: msg.question.elementId,
			});
		}
	checkIfQueryDone();
};
const handleQuery = (msg) => {
	console.log("Searching query:", msg.query);

	const textElements = $("p,ul,ol");
	const searchable = textElements
		.filter(searchableElement)
		.filter((idx, el) => el.offsetParent !== null);

	console.log("Searching", searchable.length, "text elements");

	searchable.each((idx, element) => {
		const context = $(element).text().trim();
		const elementId = uuidv4();
		$(element).attr(DATA_ATTR_ELEMENT_ID, elementId);
		chrome.runtime.sendMessage(
			{
				type: "QUESTION",
				elementId: elementId,
				question: msg.query,
				context: context,
			},
			handleMsg
		);
	});
	// const passage =
	// 		"Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Four technology companies, alongside Amazon, Apple, and Facebook. Google was founded in September 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in California. Together they own about 14 percent of its shares and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a California privately held company on September 4, 1998, in California. Google was then reincorporated in Delaware on October 22, 2002. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google is Alphabet's leading subsidiary and will continue to be the umbrella company for Alphabet's Internet interests. Sundar Pichai was appointed CEO of Google, replacing Larry Page who became the CEO of Alphabet.";
	// const question = "Who is the CEO of Google?";
	// 	chrome.runtime.sendMessage(
	// 			{
	// 				type: "QUESTION",
	// 				question: question,
	// 				context: passage,
	// 			},
	// 			handleMsg
	// 		);
};
const clearSelection = () => {
	// Remove old highlight if it exists.
	const oldElement = $("[" + DATA_ATTR_SELECTED + "]");
	if (oldElement.length > 0) {
		oldElement.removeAttr(DATA_ATTR_SELECTED);
		var instance = new Mark(oldElement[0]);
		instance.unmark({
			done: () => {
				$("." + CLASS_NAME_MARKED_SCORE).remove();
			},
		});
	}
};
const handleSelection = (msg) => {
	clearSelection();

	// Add new highlight;
	const element = findElementById(msg.elementId);
	element.attr(DATA_ATTR_SELECTED, "true");
	element[0].scrollIntoView({
		block: "end",
		inline: "nearest",
	});
	var instance = new Mark(element[0]);
	instance.mark(msg.answer.text, {
		className: CLASS_NAME_MARKED,
		acrossElements: true,
		separateWordSearch: false,
	});
};
const handleClear = () => {
	clearSelection();
	findAllElements()
		.removeAttr(DATA_ATTR_SUCCESS)
		.removeAttr(DATA_ATTR_ELEMENT_ID);
};
// const sendMessageToPopup = (message) => {
// 	console.log("Send msg to popup:", message);
// 	chrome.runtime.sendMessage(message);
// };
const main = () => {
	console.log("[content.js] Main");
	// qna.load().then((model) => {
	// 		sendMessageToPopup({
	// 			type:"MODEL_LOADED",
	// 		});
	// 		console.log("Model loaded");
	// 	});
	/**
	 * Fired when a message is sent from either an extension process or a content script.
	 */
	// eslint-disable-next-line no-undef
	chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
};
// eslint-disable-next-line no-undef
main();

const handleMsg = (msg, sender, callback) => {
	if (!msg) {
		return;
	}

	console.log("recieved msg:", msg, "from:", sender);


	switch (msg.type) {
		case "POPUP_LOADED":
		case "MODEL_LOADED":
		case "MODEL_ERROR":
			break;
		case "QUERY":
			handleQuery(msg);
			break;
		case "QUESTION_RESULT":
			handleModelSuccess(msg);
			break;
		case "SELECT":
			handleSelection(msg);
			break;
		case "CLEAR":
			handleClear();
			break;
		default:
			console.error("Did not recognize message type:", msg);
	}
};

chrome.runtime.onMessage.addListener(handleMsg);
