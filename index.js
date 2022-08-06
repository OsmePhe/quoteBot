const axios = require('axios');
const https = require('https');
const path = require('path');
const fs = require('fs');
// const config = require("c:/wamp64/www/twitter_bot/back_bot/config/config.env"); 
const Twit  = require("twit");

const T = new Twit({
    consumer_key : "wS806NJ9j6BqJzBckC79IppXX",
    consumer_secret : "qhmkFawk1pymBfUH7zpG1LUYQRZtGuvv7JT5UslSkuq2Uu3dbK",
    access_token : "1450948948714266625-CzSHgdCnqIuWbLQQF120XT8oiMUbhR",
    access_token_secret : "Vo1Lhotg4ogPdMva0gZrEjivmIqKeo6E317eaqvbRzfgJ",
})
var quote, wordTosearch = 'cocoBot', countSearch = '100';
///////////////////Upload quotes and dog on twitter
searchTweetByWord();//'osmeCoco9510', '100'
setTimeout(searchTweetByWord, 60000*60*3);//6000*60*60
var filename, resTweetFinal;
function download(url) {
 filename = path.basename(url);
 console.log(filename);
 const req = https.get(url,function(res){
   const fileStream = fs.createWriteStream(filename);
   res.pipe(fileStream);

   fileStream.on('error',function(err){
    console.log("Error stream: " + err);
   })

   fileStream.on('finish',function(){
    fileStream.close();
    console.log("ok!");
   })
 })
 req.on("error",function(err){
   console.log("Error dowloading the file " + err)
 })
 
}
function resolveAfter2Seconds(filenameUpload, word) {
  return new Promise(resolve => {
    setTimeout(() => {
      var imageAsBase64 = fs.readFileSync(filenameUpload, 'base64');
      // console.log(imageAsBase64);
      resTweetFinal = word;
      T.post('media/upload',{media_data: imageAsBase64}, uploaded);
    }, 5000);
  });
}
async function asyncCallFileName(response, word) {
  var filenameUpload = response.data.message.substring(response.data.message.lastIndexOf('/')+1);
  //console.log(filenameUpload);
  const result = await resolveAfter2Seconds(filenameUpload, word);
  //console.log(result);
}
async function searchTweetByWord() {//word, count
  var word = wordTosearch;
  var count = countSearch;
  try {
  console.log(word);
  console.log(count);
  const response = await new Promise((resolve, reject) => {
    T.get('search/tweets', { q: word, result_type: 'recent', count: count}).then(res => {
        const tweets = res.data.statuses;
        resolve(tweets);
	  }).catch((error) => {
        console.log(error);
    });
  },10000);
    // var temp = response.filter(function(it){ return (it.text.endsWith('quoi') || it.text.endsWith('quoi?') || it.text.endsWith('quoi ?') || it.text.endsWith('quoi!') || it.text.endsWith('quoi !'))});
    tweetDog(word);
    return response;
  } catch (error) {
    console.log(error);
  }
}
function tweetDog(word) {
   axios.get('https://dog.ceo/api/breed/shiba/images/random',{headers: {'Accept': 'application/json'}})
  .then(response => {
    if(!response.data.err){
    if (response.data) {
      tweetQuotes();
      download(response.data.message);
      asyncCallFileName(response, word);
    }
  }
  })
  .catch(error => {
    console.log("login error", error);
  });
}
function tweetQuotes() {
   axios.get('https://game-of-thrones-quotes.herokuapp.com/v1/random',{headers: {'Accept': 'application/json'}})
  .then(response => {
    if(!response.data.err){
    if (response.data) {
      quote = response.data;
      return response.data;
    }
  }
  })
  .catch(error => {
    console.log("login error", error);
  });
}
function uploaded(err,data,response) {
  var id = data.media_id_string;
  var meta_params = { media_id: id, alt_text: { text: 'bepbop' } };
  const filterStream = T.stream('statuses/filter', { track: [resTweetFinal]})
	filterStream.on('tweet', function(tweet) {
		T.post('favorites/create', {id: tweet.id_str}, responseCallback)

		// Retweet
		T.post('media/metadata/create', meta_params, function (err, data, response) {
      console.log(response)
    if (!err) {
      T.post('statuses/update',{status: "@" + tweet.user.screen_name + '#'+quote.character.house.slug + ' ' + quote.sentence + ' ' + quote.character.name, media_ids: [id], in_reply_to_status_id: tweet.id_str}, responseCallback);
      }
    });
	})
}
function responseCallback(err) {
    if(err) console.log("error:", err)
}