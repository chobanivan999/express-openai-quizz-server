const express = require('express');
require("dotenv").config();
const axios = require('axios');
const bp = require("body-parser");
const fileUpload = require("express-fileupload");
const pdfParse = require('pdf-parse');
const { google } = require('googleapis');

const app = express();
const cors = require('cors');

app.use("/", express.static("public"));
app.use(fileUpload());
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Set up Google API credentials
var google_api_key = process.env.GOOGLE_API_KEY;
// OpenAI API endpoint
const openAiEndpoint = 'https://api.openai.com/v1/engines/gpt-3.5-turbo/completions';
// OpenAI API key
const openAiApiKey = process.env.OPENAI_API_KEY;

// const youtube = google.youtube({
//     version: 'v3',
//     auth: google_api_key
//   });
  
// async function getVideoTranscriptFromYouTubeLink(youtubeLink) {
//     try {
//         // Extract video ID from the YouTube link
//         const videoId = youtubeLink.split('v=')[1];

//         // Retrieve caption information for the video
//         const captionsResponse = await youtube.captions.list({
//         part: 'snippet',
//         videoId: videoId
//         });

//         // Get the caption track ID
//         const captionTrackId = captionsResponse.data.items[0].id;

//         // Retrieve the full transcript text using the caption track ID
//         const transcriptResponse = await youtube.captions.download({
//         id: captionTrackId,
//         tfmt: 'ttml' // You may need to adjust the format based on your requirements
//         });

//         const transcriptText = transcriptResponse.data;

//         return transcriptText;
//     } catch (error) {
//         console.error('Error fetching video transcript:', error);
//         return '';
//     }
// }


// Function to fetch video details from YouTube Data API
async function fetchVideoDetails(videoId, apiKey) {
    try {
      var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
      
      var response = await axios.get(url);
      var videoData = response.data;
  
      if (videoData.items.length > 0) {
        var videoDetails = videoData.items[0].snippet;
        return videoDetails;
      } else {
        throw new Error('Video not found');
      }
    } catch (error) {
      throw new Error('Error fetching video details: ' + error.message);
    }
  }
  
  // Function to extract video ID from YouTube video link
  function extractVideoId(videoLink) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = videoLink.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    }
    return null;
  }
  
  // Function to generate summary from video details
  function generateSummary(videoDetails) {
    const title = videoDetails.title;
    const description = videoDetails.description;
    const summary = `Title: ${title}\n\nDescription: ${description}`;
    return summary;
  }

  async function generateQuiz(promptconent) {
    
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            'model': 'gpt-3.5-turbo',
            'messages': [
                { 
                    role: "system", 
                    content: "generate 20 quiz list. one question has 4 answer list and indicate one correct answer for every quiz. The result json type should be exactly same with bellow type. data={'quizList':[{'question':'question', options:['answer1','answer2','answer3','answer4'],'correct_answer':'answer'}]}"
                },
                {
                    role: "user", 
                    content: promptconent
                }
            ]
        },
        {
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`
          }
        }
    );
    return response.data.choices[0]['message']['content'];
}

app.get('/', (req, res) => {
    res.send('Hello from our server!')
})

app.post("/parsefile", (req, res) => {
  if (!req.files && !req.files.quizfile) {
      res.status(400);
      res.end();
  }

  pdfParse(req.files.quizfile).then(result => {
    var text = result.text.replace(/\n/gi, " ");
    text = text.slice(0, 4096);
      generateQuiz(text).then(quiz => {
        res.send(quiz);
      }).catch((error1) => {
        console.error(error1);
        res.send(error1);
      })
  });
});

app.post('/video', (req, res) => {
  
  var rescont = "{\n  \"quiz_list\": [\n    {\n      \"question\": \"Which programming language is commonly used for website development?\",\n      \"options\": [\"Python\", \"Java\", \"PHP\", \"C#\"],\n      \"correct_answer\": \"PHP\"\n    },\n    {\n      \"question\": \"Which JavaScript framework is used for building user interfaces?\",\n      \"options\": [\"Angular 9\", \"ExpressJS\", \"Django\", \"Spring Boot\"],\n      \"correct_answer\": \"Angular 9\"\n    },\n    {\n      \"question\": \"Which database system is known for its scalability and flexibility?\",\n      \"options\": [\"MySQL\", \"MongoDB\", \"SQLite\", \"PostgreSQL\"],\n      \"correct_answer\": \"MongoDB\"\n    },\n    {\n      \"question\": \"Which front-end framework provides a library of customizable components?\",\n      \"options\": [\"ReactJS\", \"VueJS\", \"Spring Boot\", \"Laravel\"],\n      \"correct_answer\": \"ReactJS\"\n    },\n    {\n      \"question\": \"Which CSS framework is widely used for responsive web design?\",\n      \"options\": [\"Material UI\", \"Element UI\", \"Bootstrap\", \"Tailwind CSS\"],\n      \"correct_answer\": \"Bootstrap\"\n    },\n    {\n      \"question\": \"Which back-end framework is associated with Python programming language?\",\n      \"options\": [\"Laravel\", \"Spring Boot\", \"Django\", \"ExpressJS\"],\n      \"correct_answer\": \"Django\"\n    },\n    {\n      \"question\": \"Which JavaScript library simplifies HTML document traversal and manipulation?\",\n      \"options\": [\"VueJS\", \"Angular 9\", \"ReactJS\", \"JQuery\"],\n      \"correct_answer\": \"JQuery\"\n    },\n    {\n      \"question\": \"Which CSS framework follows Google's Material Design principles?\",\n      \"options\": [\"Material UI\", \"Element UI\", \"Bootstrap\", \"Tailwind CSS\"],\n      \"correct_answer\": \"Material UI\"\n    },\n    {\n      \"question\": \"Which front-end framework focuses on building interactive single-page applications?\",\n      \"options\": [\"Angular 9\", \"VueJS\", \"ReactJS\", \"Spring Boot\"],\n      \"correct_answer\": \"VueJS\"\n    },\n    {\n      \"question\": \"Which database system is known for its relational model and robust features?\",\n      \"options\": [\"MongoDB\", \"MySQl\", \"SQLite\", \"PostgreSQL\"],\n      \"correct_answer\": \"PostgreSQL\"\n    },\n    {\n      \"question\": \"Which programming language is commonly used for web application development?\",\n      \"options\": [\"Java\", \"Python\", \"C#\", \"PHP\"],\n      \"correct_answer\": \"Python\"\n    },\n    {\n      \"question\": \"Which JavaScript runtime is built on Chrome's V8 engine?\",\n      \"options\": [\"NodeJS\", \"ExpressJS\", \"Django\", \"Spring Boot\"],\n      \"correct_answer\": \"NodeJS\"\n    },\n    {\n      \"question\": \"Which back-end framework is associated with Java programming language?\",\n      \"options\": [\"Laravel\", \"Spring Boot\", \"Django\", \"ExpressJS\"],\n      \"correct_answer\": \"Spring Boot\"\n    },\n    {\n      \"question\": \"Which CSS framework is designed for building user interfaces with a modern look and feel?\",\n      \"options\": [\"Material UI\", \"Element UI\", \"Bootstrap\", \"Tailwind CSS\"],\n      \"correct_answer\": \"Tailwind CSS\"\n    },\n    {\n      \"question\": \"Which front-end framework uses a component-based architecture for building reusable UI components?\",\n      \"options\": [\"Angular 9\", \"VueJS\", \"ReactJS\", \"Spring Boot\"],\n      \"correct_answer\": \"ReactJS\"\n    },\n    {\n      \"question\": \"Which JavaScript library is used for building interactive and engaging user interfaces?\",\n      \"options\": [\"VueJS\", \"Angular 9\", \"ReactJS\", \"JQuery\"],\n      \"correct_answer\": \"ReactJS\"\n    },\n    {\n      \"question\": \"Which CSS framework is known for its customizable and extensible themes?\",\n      \"options\": [\"Material UI\", \"Element UI\", \"Bootstrap\", \"Tailwind CSS\"],\n      \"correct_answer\": \"Element UI\"\n    },\n    {\n      \"question\": \"Which programming language is commonly used for mobile app development?\",\n      \"options\": [\"Java\", \"Python\", \"C#\", \"Swift\"],\n      \"correct_answer\": \"Swift\"\n    },\n    {\n      \"question\": \"Which JavaScript framework is used for building RESTful APIs?\",\n      \"options\": [\"Angular 9\", \"ExpressJS\", \"Django\", \"Spring Boot\"],\n      \"correct_answer\": \"ExpressJS\"\n    },\n    {\n      \"question\": \"Which database system is known for its open-source and relational database management system?\",\n      \"options\": [\"MongoDB\", \"MySQL\", \"SQLite\", \"PostgreSQL\"],\n      \"correct_answer\": \"MySQL\"\n    }\n  ]\n}";
  var summary = "I am from Canada. I am 30 years old. I like football and music. I am happy to tell you about my skills. I have read your requirement and I noticed that I am appropriate to this project. I have rich experiences with website development using HTML, Javascript, PHP, ODOO, Laravel, VueJS, ExpressJS, ReactJS, Angular 9, Element UI, Bootstrap, Material UI, MongoDB, MySQL, Spring Boot, Django, Jquery. I promise I can finish your project in time with high quality. Hope your kind contact.";
  // res.send(rescont);
  
  // Fetch video details and generate summary
  const youtubeVideoLink = req.body.videolink;
  var videoId = extractVideoId(youtubeVideoLink);
  console.log(videoId);
  fetchVideoDetails(videoId, google_api_key)
  .then((videoDetails) => {
      var summary = generateSummary(videoDetails);
      summary = summary.replace(/\n/gi, "");
      generateQuiz(summary).then(quiz => {
          res.send(quiz);
      }).catch((error1) => {
          console.error(error1);
          res.send(error1);
      })
  })
  .catch((error) => {
      console.error(error);
      res.send(error);
  });

  // getVideoTranscriptFromYouTubeLink(youtubeVideoLink)
  // .then(transcriptText => {
  //     console.log(transcriptText);
  //     res.send(transcriptText);
  // })
  // .catch(error => {
  //     console.error(error);
  // });
})

app.listen(8080, () => {
      console.log('server listening on port 8080')
})

// Export the Express API
module.exports = app;