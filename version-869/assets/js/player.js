(function () {
    var hlsLibraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    var hlsLoading = null;

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        if (!hlsLoading) {
            hlsLoading = new Promise(function (resolve) {
                var script = document.createElement("script");
                script.src = hlsLibraryUrl;
                script.async = true;
                script.onload = resolve;
                script.onerror = resolve;
                document.head.appendChild(script);
            });
        }

        hlsLoading.then(callback);
    }

    function start(wrapper) {
        var video = wrapper.querySelector("video");
        var button = wrapper.querySelector(".player-cover-button");
        var stream = wrapper.getAttribute("data-stream");

        if (!video || !stream) {
            return;
        }

        if (button) {
            button.classList.add("is-hidden");
        }

        function playVideo() {
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== stream) {
                video.setAttribute("src", stream);
            }
            playVideo();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (!video.hlsPlayer) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.hlsPlayer = hls;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                } else {
                    playVideo();
                }
            } else {
                if (video.getAttribute("src") !== stream) {
                    video.setAttribute("src", stream);
                }
                playVideo();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (wrapper) {
        var video = wrapper.querySelector("video");
        var button = wrapper.querySelector(".player-cover-button");

        if (button) {
            button.addEventListener("click", function () {
                start(wrapper);
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start(wrapper);
                }
            });
        }
    });
})();
