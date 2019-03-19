require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const fuzz = require("fuzzball");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const song_name = process.argv[2];

(async () => {
  try {
    console.log("Authenticating...");
    const credentials = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(credentials.body.access_token);
    console.log("Getting playlists...");
    let length = 50;
    let offset = 0;
    while (length > 0) {
      const playlists = await spotifyApi.getUserPlaylists("blrobin2", {
        offset: offset,
        limit: 50,
        fields: "items"
      });
      length = playlists.body.items.length;
      offset += playlists.body.items.length;
      for (const { id: p_id, name: p_name } of playlists.body.items) {
        const tracks = await spotifyApi.getPlaylistTracks(p_id);
        for (const { track } of tracks.body.items) {
          const ratio = fuzz.ratio(track.name, song_name);
          if (ratio >= 80) {
            console.log("----------------------------");
            console.log(`${track.artists[0].name} - ${track.name}`);
            console.log("--- is on ---");
            console.log(p_name + "\n\n");
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
})();
