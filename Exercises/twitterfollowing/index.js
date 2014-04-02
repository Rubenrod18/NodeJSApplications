var twitter = require('ntwitter');
var screen_name = '@'; // example: @RubenRod_18

var twit = new twitter({
    consumer_key: '', // Enter your consumer_key
    consumer_secret: '', // Enter your consumer_secret
    access_token_key: '', // Enter your access_token_key
    access_token_secret: '' // Enter your access_token_secret
  });

/*
 * Function that return the difference between the now
 * hour and the hour to next request in milliseconds.
 */
function calculateDifference(time) {
  var hour, minutes, seconds, requestMilliseconds, dateMilliseconds, date;

  // We get hour, minutes and seconds for next request.
  hour = time.getHours(time);
  minutes = time.getMinutes(time);
  seconds = time.getSeconds(time);

  // Now, we should to convert hour, minutes and seconds in milliseconds.
  requestMilliseconds = hour * 3600000 + minutes * 60000 + seconds * 1000;

  // We create a Object of type Date and we get the hour, minutes and seconds.
  // Now, we should to convert hour, minutes and seconds in milliseconds.
  date = new Date();
  dateMilliseconds = date.getHours() * 3600000 +
                     date.getMinutes() * 60000 +
                     date.getSeconds() * 1000;

  return requestMilliseconds - dateMilliseconds;
}

/*
 * Function that show the time to go back to
 * request to the Twitter REST API.
 */
function showRemainingTime(time) {
  var hour, minutes, seconds;

  hour = time.getHours(time);
  minutes = time.getMinutes(time);
  seconds = time.getSeconds(time);

  console.log('You can make requests to the Twitter REST API the ' + hour
                    + ':' + minutes
                    + ':' + seconds);
}

function show(nickName, followingId, followingNickname) {
  console.log('Nickname: ' + nickName);
  console.log('Following ID: ' + followingId);
  console.log('First Following: ' + followingNickname);
}

function ratedLimit(err, params) {
  var remainingTime = err.headers['x-rate-limit-reset'];
  var time = new Date(remainingTime * 1000); // Convert seconds to milliseconds because
                                              // the TIMESTAMP in JavaScript it works in milliseconds.
  showRemainingTime(time);

  setTimeout(function () {
    console.log('Inside setTimeout');
    var url = '/followers/ids.json';

    if (params.screen_name) {
      params = { key: 'ids', screen_name: params.screen_name, cursor: params.nextCursor };
    }

    if (params.user_id) {
      params = { key: 'ids', user_id: params.user_id, cursor: params.nextCursor };
    }

    twit._getUsingCursor(url, params, showFirstFollowing);
  }, calculateDifference(time)); // It works, when countdown comes to zero
}


function showFirstFollowing(err, params) {
  if (err) {
    return ratedLimit(err, params);
  }

  // Show the first following
  twit.showUser(params[params.length - 1], function (err, params) {
    if (err) {
      return console.log(err);
    }
    show(screen_name.substr(1, screen_name.length), params.id, params.screen_name);
  });

} // showFirstFollowing

twit.getFriendsIds(screen_name, showFirstFollowing);
