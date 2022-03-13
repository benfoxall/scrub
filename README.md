# Scrub

Video scrubbing with WebCodecs.

This effect is usually made by downloading each frame as an image, though this demo uses a single file and extracts frames with WebCodecs.

Most of the important stuff is from the w3c WebCodecs mp4-decode sample:
https://github.com/w3c/webcodecs/tree/main/samples/mp4-decode

![scrub](https://media.giphy.com/media/K1hcRycU5tSOvbqN7g/giphy.gif)

## Sources

### Code

The video decoding code came from the w3c WebCodecs sample repo

- https://github.com/w3c/webcodecs/tree/main/samples/mp4-decode

### Video

Earth video genearated from [NOAA / GOES Image Viewer](https://www.star.nesdis.noaa.gov/goes/fulldisk_band.php?sat=G16&band=GEOCOLOR&length=12&dim=1)

- https://gist.github.com/benfoxall/2741f5383528e6d2bc4c609b812310f1

Inky water video - by hicham yah from Pexels

- https://www.pexels.com/video/mixture-of-smoke-with-different-colors-2025634/

## :link:

- https://github.com/benfoxall/video-stills Previous hack (using wasm & broadway to decode)

---

## TODO

- [x] Time ribbon
- [ ] streaming decoder
- [ ] live video
- [ ] video loops
- [x] drag upload
