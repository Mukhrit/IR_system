import { useEffect, useState, useRef } from "react";
import "@tensorflow/tfjs";
import * as qna from "@tensorflow-models/qna";
import { getCurrentTabUId, getCurrentTabUrl } from "./chrome/utils";

function Home() {
	const [url, setUrl] = useState("");
	const [responseFromContent, setResponseFromContent] = useState("");
    const qnamodel=useRef();
    const passage = useRef();
	const loadandtest = async () => {
		qnamodel.current = await qna.load();
        console.log("Model Loaded");
	};
	useEffect(() => {
		getCurrentTabUrl((url) => {
			setUrl(url || "undefined");
		});
		loadandtest();
	}, []);
	const sendTestMessage = () => {
		const message = {
			from: "react-app",
			message: "all-text",
		};

		getCurrentTabUId((id) => {
			id &&
				// eslint-disable-next-line no-undef
				chrome.tabs.sendMessage(id, message, (responseFromContentScript) => {
                  localStorage.setItem(
										"response",
										JSON.stringify(responseFromContentScript)
									);
				});
		});
	};
	const sendRemoveMessage = () => {
		const message = {
			from: "react-app",
			message: "delete logo",
		};
		getCurrentTabUId((id) => {
			id &&
				// eslint-disable-next-line no-undef
				chrome.tabs.sendMessage(id, message, (response) => {
					setResponseFromContent(response);
				});
		});
	};
    const SearchAns=async ()=>{
	    const question = "Who is the CEO of Google?";
        const passage=JSON.parse(localStorage.getItem("response"));
        if(qnamodel.current){
            const answers = await qnamodel.current.findAnswers(
							question,
							passage
						);

						console.log("Answers: ");
						console.log(answers);
        }
    }
	return (
		<div className="bg-blue-100 p-5 ">
			{url}
			<button
				onClick={() => SearchAns()}
				className="bg-yellow-100 p-2 m-1 pointer-cursor"
			>
				{" "}
				All Text
			</button>
			<button
				onClick={()=>	sendTestMessage()}
				className="bg-red-100 p-2 m-1 pointer-cursor"
			>
				{" "}
				Remove logo
			</button>
			<p>Response from content:</p>
		</div>
	);
}

export default Home;
