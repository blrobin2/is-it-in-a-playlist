require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const fuzz = require('fuzzball');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const song_name = process.argv[2];

(async () => {
  try {
    console.log('Authenticating...');
    const credentials = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(credentials.body.access_token);
    console.log('Getting playlists...');
    let length = 20;
    let offset = 0;
    while (length > 0) {
      const playlists = await spotifyApi.getUserPlaylists('blrobin2', { offset: offset });
      length = playlists.body.items.length;
      offset += playlists.body.items.length;
      for (const playlist of playlists.body.items) {
        const playlist_details = await spotifyApi.getPlaylistTracks(playlist.id);
        for (const { track } of playlist_details.body.items) {
          const ratio = fuzz.ratio(track.name, song_name);
          if (ratio >= 80) {
            console.log("----------------------------");
            console.log(`${track.artists[0].name} - ${track.name}`);
            console.log("--- is on ---");
            console.log(playlist.name + "\n\n");
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
})();