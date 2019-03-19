'use strict';

require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const fuzz = require("fuzzball");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const args = require("minimist")(process.argv.slice(2), {
  alias: {
    t: 'title',
    a: 'artist'
  }
});

const song_name = args.t;
const artist = args.a;

const get_ratio = (t, a) => {
  if (song_name) {
    return fuzz.ratio(t, song_name);
  }
  if (artist) {
    return fuzz.ratio(a, artist);
  }
  throw new Error('Pass something, stupid');
}

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
          const artist = track.artists[0].name;
          const song_name = track.name;
          const ratio = get_ratio(song_name, artist);
          if (ratio >= 80) {
            console.log("----------------------------");
            console.log(`${artist} - ${song_name}`);
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
