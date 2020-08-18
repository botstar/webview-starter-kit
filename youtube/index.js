var player;
var videoId;

function onChatBotReady() {
  // You have to define HTML meta "bs:input:youtubeUrl" in order to inform bot send data to youtubeUrl parameter webview
  var youtubeUrl = BotStarWebview('getParameter', 'youtubeUrl');

  // You have to define HTML meta "bs:input:buttonName" in order to inform bot send data to buttonName parameter webview
  var btnName = BotStarWebview('getParameter', 'buttonName');

  var btn = document.getElementById('btn');
  if (btnName) {
    btn.appendChild(document.createTextNode(btnName));
    btn.style.display = 'inline-block';
  }

  _loadYoutubeIframeApi(youtubeUrl);
}

function sendResponse() {
  var currentSeconds = player ? player.getCurrentTime() : 0;

  /*
    @param state: will be mapped to chatbot's latest response. It is string only.
    @param { currentSeconds }: will be sent back to chatbot. You have to define HTML meta "bs:output:currentSeconds" in order to send back.
                                You can send as many pro as you want, i.e: { customerName: 'Tommy', age: maxAge }
                                then define two HTML metas "bs:output:customerName" and "bs:output:age"
    @param clicked: outlet name, will be sent back to chatbot. You have to define HTML meta "bs:outlet:Button Clicked" in order to send back.
  */
  BotStarWebview('sendResponse', state, { currentSeconds }, 'Button Clicked').catch((err) => {
    console.log(err);
  });
}

function _onPlayerReady(event) {
  event.target.playVideo();
}

var state = '';
var ALL_STATES = ['ended', 'playing', 'paused', 'buffering', 'video cued'];
function _onPlayerStateChange(event) {
  if (event.data === -1) {
    state = 'unstarted';
  } else if (ALL_STATES[event.data]) {
    state = ALL_STATES[event.data];
  }
}

function _loadYoutubeIframeApi(youtubeUrl) {
  var videoId = youtubeUrl ? _parseVideoId(youtubeUrl) : '';
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  if (videoId) {
    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player('player', {
        height: '340',
        width: '100%',
        videoId,
        events: {
          onReady: _onPlayerReady,
          onStateChange: _onPlayerStateChange,
        },
      });
    };
  } else {
    var div = document.getElementById('player');
    div.innerHTML = 'Invalid Video ID';
  }
}

function _parseVideoId(url) {
  var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  return match && match[1].length == 11 ? match[1] : false;
}
