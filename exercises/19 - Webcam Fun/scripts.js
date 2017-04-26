const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
	navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		})
		.then(localMediaStream => {
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		.catch(err => {
			console.error('Error!', err);
		})
}

// Take a frame from this video, and to paint it on to the actual canvas on the screen
function paintToCanavas() {
	const width = video.videoWidth;
	const height = video.videoHeight;
	// Need to sure that canvas is the exact same size of the video before paint to it
	canvas.width = width;
	canvas.height = height;

	// Every milliseconds, going to take an image from the webcam and put it on canvas
	return setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height);
		
		// Take the pixels out
		let pixels = ctx.getImageData(0, 0, width, height);
		// console.log(pixels);
		// debugger;
		
		// Mess with them
		//pixels = redEffect(pixels);
		//pixels = rgbSplit(pixels);
		//ctx.globalAlpha = 0.1;
		pixels = greenScreen(pixels);
		
		
		// Put them back
		ctx.putImageData(pixels, 0, 0);
	}, 16);

	//console.log(width, height);
}

// Take photo
function takePhoto() {
	// Play the sound
	snap.currentTime = 0;
	snap.play();
	
	// Take the data out of the canvas
	const data = canvas.toDataURL('image/jpeg');
	// Create a link
	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'photo');
	link.innerHTML = `<img src="${data}" alt="Your Photo" />`;
	// Going to dump the links and insert before strip.fisrtChild (like .prepend in jQuery)
	strip.insertBefore(link, strip.firsChild);
	
}

function redEffect(pixels) {
	for(let i = 0; i < pixels.data.length; i+=4) {
		
		pixels.data[i + 0] = pixels.data[i + 0] + 100;// red
		pixels.data[i + 1] = pixels.data[i + 1] - 50;// green
		pixels.data[i + 2] = pixels.data[i + 2] * 0.5;// blue
	}
	return pixels;
}

function rgbSplit(pixels) {
	for(let i = 0; i < pixels.data.length; i+=4) {
		
		pixels.data[i - 150] = pixels.data[i + 0];// red
		pixels.data[i + 500] = pixels.data[i + 1];// green
		pixels.data[i - 150] = pixels.data[i + 2];// blue
	}
	return pixels;
}

function greenScreen(pixels) {
	const levels = {};
	
	document.querySelectorAll('.rgb input').forEach((input) => {
      levels[input.name] = input.value;
    });

		// Loop over in every single pixel, figure out what the red, green, blue and alpha are
    for (i = 0; i < pixels.data.length; i += 4) {
      red = pixels.data[i + 0];
      green = pixels.data[i + 1];
      blue = pixels.data[i + 2];
      alpha = pixels.data[i + 3];

			// If it's anywhere in between those min and max values, take it out
      if (red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax) 
      {
			// take it out
        pixels.data[i + 3] = 0;
      }
    }
	
    return pixels;
}

getVideo();

//

// Once the video is playing, it's going to emit an event called canplay
video.addEventListener('canplay', paintToCanavas);
document.querySelector('.takePhoto').addEventListener('click', takePhoto);