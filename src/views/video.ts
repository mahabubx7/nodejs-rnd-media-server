export default function (videoSrc: string) {
  const makeUrl = `/watch${videoSrc}`

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <link href="/assets/video.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/linearicons.min.css" />
    <link href="/assets/main.css" rel="stylesheet" />
    <title>${makeUrl}</title>
  </head>
  <body>
    <main class="video_page">
    <p class="w-full text-center absolute top-[5px] left-0">
        <button class="py-1.5 px-4 bg-orange-500 hover:bg-orange-600 transition-colors text-white rounded-md" onclick="copyToClipboard('${makeUrl}')">
          <span class="lnr lnr-link"></span>
          <span>Copy Stream Link</span>
        </button>
      </p>


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

      function copyToClipboard(text) {
        'use strict';
          // Get the protocol (http or https)
        var protocol = window.location.protocol;
    
          // Get the hostname (domain or IP address)
          var hostname = window.location.hostname;
    
          // Get the port (defaults to 80 for http, 443 for https)
          var port = window.location.port;
    
          // Construct the base address
          var getPort = port ? ":" + port : "";
          var baseUrl = protocol + "//" + hostname + "" + getPort;
    
          // Create a temporary input element
          var input = document.createElement('input');
          input.style.position = 'fixed';
          input.style.opacity = 0;
          var url = baseUrl + "" + text;
          console.log(url);
          input.value = url;
          document.body.appendChild(input);
          
          // Select the text in the input element
          input.select();
          input.setSelectionRange(0, 99999); // For mobile devices
          
          // Copy the text to the clipboard
          document.execCommand('copy');
          
          // Remove the temporary input element
          document.body.removeChild(input);
          
          // Provide some feedback to the user
          alert('Stream link copied to clipboard!');
        }
    </script>
  </body>
  </html>
  `
}
