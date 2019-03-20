"use strict";
require("dotenv").config();

const spotifyApi = new (require("spotify-web-api-node"))({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

(async () => {
  try {
    console.log("Authenticating...");
    await set_credentials();
    console.log("Getting playlists...");
    await check_each_playlist_for("blrobin2");
  } catch (e) {
    console.error(e);
  }
})();

async function set_credentials() {
  const credentials = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(credentials.body.access_token);
}

async function check_each_playlist_for(user_id) {
  for await (const playlists of playlist_chunker(user_id)) {
    await Promise.all(
      playlists.body.items.map(({ id, name }) =>
        rate_limited_get_tracks(id, name)
      )
    );
  }
}

const playlist_chunker = (user_id) => {
  function playlist_chunk_iter() {
    let length = 50;
    let offset = 0;
    return {
      async next() {
        if (length > 0) {
          const playlists = await spotifyApi.getUserPlaylists(user_id, {
            offset: offset,
            limit: 50,
            fields: "items"
          });
          length = playlists.body.items.length;
          offset += playlists.body.items.length;
          return {
            value: playlists,
            done: false
          };
        }
        return Promise.resolve({
          done: true
        });
      }
    };
  }

  return {
    [Symbol.asyncIterator]: playlist_chunk_iter
  };
};

const rate_limited_get_tracks = (rate_limit => {
  const limit = require("p-limit")(rate_limit);
  return (id, name) => limit(() => get_tracks(id, name));
})(5);

async function get_tracks(playlist_id, playlist_name) {
  const tracks = await spotifyApi.getPlaylistTracks(playlist_id);
  tracks.body.items.forEach(({ track }) =>
    print_song_if_match(track, playlist_name)
  );
}

function print_song_if_match(track, playlist_name) {
  const artist = track.artists[0].name;
  const title = track.name;
  const ratio = get_ratio(title, artist);
  if (ratio >= 80) {
    console.log("----------------------------");
    console.log(`${artist} - ${title}`);
    console.log("--- is on ---");
    console.log(playlist_name + "\n\n");
  }
}

const get_ratio = (() => {
  const { t: search_title, a: search_artist } = require("minimist")(
    process.argv.slice(2),
    {
      alias: {
        t: "title",
        a: "artist"
      }
    }
  );

  const fuzz = require("fuzzball");

  return (title, artist) => {
    if (search_title) {
      return fuzz.ratio(title, search_title);
    }
    if (search_artist) {
      return fuzz.ratio(artist, search_artist);
    }
    throw new Error("Pass something, stupid");
  };
})();
