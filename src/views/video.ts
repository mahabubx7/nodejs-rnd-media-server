export default function (videoSrc: string) {
  const makeUrl = `/watch${videoSrc}`

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <link href="/assets/video.min.css" rel="stylesheet" />
    <link href="/assets/main.css" rel="stylesheet" />
    <title>Video Player</title>
  </head>
  <body>
    <main class="video_page">
        <div class="container">
          <video
              id="player"
              class="video-js vjs-layout-small"
              controls
              preload="auto"
              width="1280"
              height="720"
      
              data-setup="{}"
              >
              <source src="${makeUrl}" type="video/mp4" />
              <source src="${makeUrl}" type="video/webm" />
              <source src="${makeUrl}" />
              <p class="vjs-no-js">
                  To view this video please enable JavaScript, and consider upgrading to a
                  web browser that
                  <a href="https://videojs.com/html5-video-support/" target="_blank"
                  >supports HTML5 video</a
                  >
              </p>
          </video>
        </div>
    </main>

    <script src="/assets/js/video.min.js"></script>
    <script>
    var player = videojs('player', {
      responsive: true,
      // breakpoints: {
      //   medium: 640,
      // },
    });

    player.breakpoints(true);
    </script>
  </body>
  </html>
  `
}
