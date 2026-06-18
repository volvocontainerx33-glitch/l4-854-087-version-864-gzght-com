(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var stream = shell.getAttribute('data-video');
    var attached = false;

    function load() {
      if (!video || !stream) {
        return;
      }
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      load();
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-video]')).forEach(attachPlayer);
})();
