# Is It In a Playlist
A dumb way of finding out if I've put a song in a playlist before

## Summary
I make a bunch of Spotify playlists, both for myself and others. When I make playlists for others, I try not to repeat songs I've put lists in the past. With so many playlists, it becomes a burden to open each one and look. So, I created this command line tool for myself that gets all my playlists, looks at the tracks for each, and does a fuzzy search with the string I passed through the command line and the title of the song. If the match ratio is at least 80, I spit out the song title and the playlist it's on.

Also, I'm very forgetful and sometimes people will ask me what I think of an artist, and I'll have listened to them at some point and have forgotten the song I heard or when I heard it. By passing an artist, using the same fuzzy search logic, I can spit out the song and playlist.

## Prior Art
* [Spotify API Node Wrapper](http://michaelthelin.se/spotify-web-api-node/) for easy Spotify API calls
* [Fuzzball](https://www.npmjs.com/package/fuzzball) for easy fuzzy string matching

## Issues
The biggest issue is that the API returns the playlists in chunks of 50, so I have to maintain some variables that update the offset and check if the API has returned anything. I'd prefer to reduce the number of calls I make and get them all at once, but that seems like it would require knowing how many playlists I have.