import React, { useState, useEffect } from "react";
import "./tailwind.css";
import Spinner from "../../assets/img/spinner.svg";
import { getCurrentTabUrl } from "./utils";
const sendMessageToBackground = (message) => {
	console.log("send msg to background:", message);
	chrome.runtime.sendMessage(message);
};
const sendMessageToContent = (message) => {
	console.log("send msg to content:", message);
	chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, message);
	});
};
const registerListener = (setState, setAnswers) => {
	chrome.runtime.onMessage.addListener((msg, sender, callback) => {
		console.log("Popup recieved msg:", msg, "from:", sender);
		switch (msg.type) {
			// Do nothing, these msgs are handled by the content script.
			case "QUESTION_RESULT":
			case "QUESTION_ERROR":
			case "QUESTION":
				break;
			case "MODEL_LOADED":
				setState(false);
				break;
			case "QUERY_RESULT":
				console.log(msg);
				setAnswers((answers) =>
					[...answers, msg].sort((msg1, msg2) => {
						if (msg1.answer.score < msg2.answer.score) {
							return 1;
						} else {
							return -1;
						}
					})
				);
				setState(false);
				break;
			case "QUERY_DONE":
				setState(false);
				break;
			default:
				break;
		}
	});
};
const Popup = () => {
	const [url, setUrl] = useState("");
	const [loading, Setloading] = useState(true);
	const [query, SetQuery] = useState("");
	var [answers, setAnswers] = useState([]);
	var [selectionIdx, setSelectionIdx] = useState(0);
	useEffect(() => {
		getCurrentTabUrl((url) => {
			setUrl(url || "undefined");
		});
	}, []);
	useEffect(() => {
		sendMessageToBackground({
			type: "POPUP_LOADED",
		});
	}, []);
	useEffect(() => {
		if (selectionIdx >= answers.length) {
			return;
		}

		sendMessageToContent({
			type: "SELECT",
			answer: answers[selectionIdx].answer,
			elementId: answers[selectionIdx].elementId,
		});
	}, [selectionIdx, answers]);
	useEffect(() => {
		registerListener(Setloading, setAnswers);
	}, [Setloading, setAnswers]);
	const search = () => {
		reset();
		sendMessageToContent({
			type: "QUERY",
			query: query,
		});
		Setloading(true);
	};

	const reset = () => {
		sendMessageToContent({
			type: "CLEAR",
		});
		setAnswers([]);
		setSelectionIdx(0);
	};
	const Increment =()=>{
		if (selectionIdx + 1 < answers.length) {
			setSelectionIdx(selectionIdx + 1);
		}
	}
	const Decrement = () => {
		if (selectionIdx - 1 >= 0) {
			setSelectionIdx(selectionIdx - 1);
		}
	};
	return (
		<div className="bg-gray-100 p-2  rounded-md flex flex-row">
			<div className="flex flex-row items-center relative text-gray-500">
				<input
					type="text"
					placeholder="Query"
					onChange={(e) => SetQuery(e.target.value)}
					className=" text-base px-2 py-1 pr-8 font-semibold text-gray-500  shadow-md focus:border-gray-400 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300"
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							search();
						}
					}}
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 absolute right-2 cursor-pointer"
					disabled={true}
					fill="none"
					viewBox="0 0 24 24"
					onClick={() => search()}
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			{loading && (
				<div className="ml-1 mt-1">
					{/* <img src={Spinner} alt="load" /> */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
						x="0px"
						y="0px"
						viewBox="0 0 50 50"
						xmlSpace="preserve"
						className="h-6 w-6 animate-spin "
					>
						<path
							fill="#000"
							d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
						></path>
					</svg>
				</div>
			)}
			
			{!loading && answers.length>0 && <div className="text-gray-500 flex flex-row items-center divide-x">
				<div
					className="hover:text-gray-400 cursor-pointer"
					onClick={() => Increment()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 11l5-5m0 0l5 5m-5-5v12"
						/>
					</svg>
				</div>
				<div
					className="hover:text-gray-400 cursor-pointer"
					onClick={() => Decrement()}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 13l-5 5m0 0l-5-5m5 5V6"
						/>
					</svg>
				</div>
				<div className="font-semibold">
					{selectionIdx+1}/{answers.length}
				</div>	
			</div>}
			{/* {url}
			{answers.map((obj) => (
				<div>
					{obj.answer.text}
					{obj.answer.score}
				</div>
			))}
			<button
				onClick={() => search()}
				className="bg-yellow-100 p-2 m-1 pointer-cursor"
			>
				{" "}
				Go
			</button>
			<button
				onClick={() => setSelectionIdx(selectionIdx + 1)}
				className="bg-yellow-100 p-2 m-1 pointer-cursor"
			>
				{" "}
				Next
			</button>
			<button
				onClick={() => setSelectionIdx(selectionIdx - 1)}
				className="bg-yellow-100 p-2 m-1 pointer-cursor"
			>
				{" "}
				Prev
			</button>
			<button className="bg-red-100 p-2 m-1 pointer-cursor">
				{" "}
				Remove logo
			</button>
			<p>Response from content:</p>
			{loading ? "loading" : "not loading"} */}
		</div>
	);
};

export default Popup;
