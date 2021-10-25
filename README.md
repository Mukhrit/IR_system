<img src="src/assets/img/icon-128.png" width="64"/>

# A Semantic Search in the broswer just with Shift+Ctrl+F

## Why?
1. It is often seen that many a times people visit pages containing massive amounts of information and they can’t accurately google the exact question due to its ambiguity. 
2. Users need accurate answers in Natural Language to their questions from blogs , papers and websites. They want enriched and interactive answers to their questions from the context of the document they are currently visiting. 
3. Google’s Ctrl+F function only provides them with matching keywords and not the actual Natural Language answers relating to the context of the question.

## Overview
1. This extension is used to search information available on a webpage and provide answers in natural language.The model takes a passage and a question as input, then returns a segment of the passage that most likely answers the question. 
2. Uses [MobileBERT](https://openreview.net/forum?id=SJxjVaNKwB) fine-tuned on SQuAD Dataset via [Tensorflow.JS](https://github.com/tensorflow/tfjs-models/tree/master/qna) to search for answers and mark relevant elements on the web page. 
3. [BERT](https://github.com/google-research/bert), or Bidirectional Encoder Representations from Transformers, is a method of pre-training language representations which obtains state-of-the-art results on a wide array of Natural Language Processing tasks.
4. It requires semi-complex pre-processing including tokenization and post-processing steps.

## How It Works
Every time a user executes a search:
1. The content script collects all `<p>, <div>` elements on the page and extracts text from each.
2. The background script executes the question-answering model on every element, using the query as the question and the element's text as the context.
3. If a match is returned by the model, it is highlighted within the page along with the confidence score returned by the model.
  
## Installing and Running

### Procedures:
1. Clone this repository.
2. Run `npm install  or yarn` to install the dependencies.
3. Run `npm start or yarn start`
4. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
5. Happy hacking.

## Deployment

After the development of your extension run the command
`npm build or yarn build`

