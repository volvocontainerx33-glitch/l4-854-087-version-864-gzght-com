(() => {
  const wrap = document.querySelector('[data-player-wrap]');

  if (!wrap) {
    return;
  }

  const video = wrap.querySelector('video');
  const layer = wrap.querySelector('[data-play-layer]');
  const button = wrap.querySelector('[data-play-button]');
  const videoUrl = wrap.getAttribute('data-video-url');
  let hlsInstance = null;
  let loaded = false;

  const loadVideo = () => {
    if (!video || !videoUrl) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      loaded = true;
    }

    if (layer) {
      layer.classList.add('hidden');
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (layer) {
    layer.addEventListener('click', loadVideo);
  }

  if (button) {
    button.addEventListener('click', loadVideo);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (!loaded || video.paused) {
        loadVideo();
      }
    });
  }

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
