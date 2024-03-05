const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const cors = require('cors');

app.use(cors())

// Function to fetch video details from YouTube Data API
async function fetchVideoDetails(videoLink, apiKey) {
    try {
      var videoId = extractVideoId(videoLink);
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

app.get('/', (req, res) => {
    res.send('Hello from our server!')
})

app.get('/video', (req, res) => {
    // Usage example
    const youtubeVideoLink = 'https://www.youtube.com/watch?v=MYyJ4PuL4pY';
    const apiKey = "AIzaSyCqR7KumMasmF_M0DKwB1S3UJnuP3GV8XY"
    // Fetch video details and generate summary
    fetchVideoDetails(youtubeVideoLink, apiKey)
    .then((videoDetails) => {
        var summary = generateSummary(videoDetails);
        console.log(summary);
        res.send(summary);
    })
    .catch((error) => {
        console.error(error);
        res.send(error);
    });
})

app.listen(8080, () => {
      console.log('server listening on port 8080')
})