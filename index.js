"use strict";

require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const fuzz = require("fuzzball");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const { t: search_title, a: search_artist } = require("minimist")(
  process.argv.slice(2),
  {
    alias: {
      t: "title",
      a: "artist"
    }
  }
);

const get_ratio = (title, artist) => {
  if (search_title) {
    return fuzz.ratio(title, search_title);
  }
  if (search_artist) {
    return fuzz.ratio(artist, search_artist);
  }
  throw new Error("Pass something, stupid");
};

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
          const title = track.name;
          const ratio = get_ratio(title, artist);
          if (ratio >= 80) {
            console.log("----------------------------");
            console.log(`${artist} - ${title}`);
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
