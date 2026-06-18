function initMoviePlayer(source) {
  var video = document.querySelector(".movie-video");
  var overlay = document.querySelector(".player-overlay");
  var errorBox = document.querySelector(".player-error");
  var hasAttached = false;
  var hls = null;

  if (!video || !overlay || !source) {
    return;
  }

  function showError() {
    if (errorBox) {
      errorBox.hidden = false;
    }
  }

  function attachSource() {
    if (hasAttached) {
      return;
    }

    hasAttached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          showError();
        }
      });
      return;
    }

    showError();
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (!hasAttached) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
