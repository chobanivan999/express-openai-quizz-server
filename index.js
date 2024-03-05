const express = require('express');
require("dotenv").config();
const axios = require('axios');
const bp = require("body-parser");
const { google } = require('googleapis');

const app = express();
const cors = require('cors');

app.use(cors())
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Set up Google API credentials
var google_api_key = process.env.GOOGLE_API_KEY;
const youtube = google.youtube({
    version: 'v3',
    auth: google_api_key
  });
  
async function getVideoTranscriptFromYouTubeLink(youtubeLink) {
    try {
        // Extract video ID from the YouTube link
        const videoId = youtubeLink.split('v=')[1];

        // Retrieve caption information for the video
        const captionsResponse = await youtube.captions.list({
        part: 'snippet',
        videoId: videoId
        });

        // Get the caption track ID
        const captionTrackId = captionsResponse.data.items[0].id;

        // Retrieve the full transcript text using the caption track ID
        const transcriptResponse = await youtube.captions.download({
        id: captionTrackId,
        tfmt: 'ttml' // You may need to adjust the format based on your requirements
        });

        const transcriptText = transcriptResponse.data;

        return transcriptText;
    } catch (error) {
        console.error('Error fetching video transcript:', error);
        return '';
    }
}

// Function to fetch video details from YouTube Data API
async function fetchVideoDetails(videoLink, apiKey) {
    try {
      var videoId = extractVideoId(videoLink);
      console.log(videoId);
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
    const match = videoLink.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }
  
  // Function to generate summary from video details
  function generateSummary(videoDetails) {
    const title = videoDetails.title;
    const description = videoDetails.description;
    const summary = `Title: ${title}\n\nDescription: ${description}`;
    return summary;
  }

  async function generateQuiz(promptconent) {
    const completionRequest = {
        prompt: [
            { role: "system", content: "generate 20 quiz list. one question has 4 answer list and indicate one correct answer for every quiz. the result data type is json." },
            { role: "user", content: promptconent}
        ],
        max_tokens: 50,
    };
    // OpenAI API endpoint
    const openAiEndpoint = 'https://api.openai.com/v1/engines/gpt-3.5-turbo/completions';
    // OpenAI API key
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            'model': 'gpt-3.5-turbo',
            'messages': [
                { 
                    role: "system", 
                    content: "generate 20 quiz list. one question has 4 answer list and indicate one correct answer for every quiz. the result data type is json." 
                },
                { 
                    role: "user", 
                    content: "I am from Canada. I am 30 years old. I like football and music. I am happy to tell you about my skills. I have read your requirement and I noticed that I am appropriate to this project. I have rich experiences with website development using HTML, Javascript, PHP, ODOO, Laravel, VueJS, ExpressJS, ReactJS, Angular 9, Element UI, Bootstrap, Material UI, MongoDB, MySQL, Spring Boot, Django, Jquery. I promise I can finish your project in time with high quality. Hope your kind contact."
                }
            ]
        },
        {
            headers: {
              'Authorization': `Bearer ${openAiApiKey}`
            }
        }
    );
    return response.data.choices[0].text;
}

app.get('/', (req, res) => {
    res.send('Hello from our server!')
})

app.get('/video', (req, res) => {
  res.send(google_api_key);
    // Usage example
    // const youtubeVideoLink = 'https://www.youtube.com/watch?v=C4ve8Kjw9ZY';
    // var summary = "I am from Canada. I am 30 years old. I like football and music. I am happy to tell you about my skills. I have read your requirement and I noticed that I am appropriate to this project. I have rich experiences with website development using HTML, Javascript, PHP, ODOO, Laravel, VueJS, ExpressJS, ReactJS, Angular 9, Element UI, Bootstrap, Material UI, MongoDB, MySQL, Spring Boot, Django, Jquery. I promise I can finish your project in time with high quality. Hope your kind contact.";
    // generateQuiz(summary).then(quiz => {
    //     res.send(quiz);
    // }).catch((error1) => {
    //     console.error(error1);
    //     res.send(error1);
    // })

    // Fetch video details and generate summary
    // fetchVideoDetails(youtubeVideoLink, google_api_key)
    // .then((videoDetails) => {
    //     var summary = generateSummary(videoDetails);
    //     generateQuiz(summary).then(quiz => {
    //         res.send(quiz);
    //     }).catch((error1) => {
    //         console.error(error1);
    //         res.send(error1);
    //     })
    // })
    // .catch((error) => {
    //     console.error(error);
    //     res.send(error);
    // });
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