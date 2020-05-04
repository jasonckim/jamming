const client_id = 'cb093e65cbc44b9d89ee80a776b773bd';
const redirect_uri = 'http://localhost:3000/'

let accessToken;

const Spotify = {
  getAccessToken() {
    if(accessToken) {
      return accessToken
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
        const accessUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`;
        window.location = accessUrl;
    }
  },

  search(searchTerm) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
      headers: { Authorization: `Bearer ${accessToken}`}
    }).then(response => {
      return response.json()
    }).then(jsonResponse => {
      if(!jsonResponse.tracks){
        return [];
      }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
    });
  },

  savePlaylist(name, trackURIs) {
    if(!name || !trackURIs.length){
      return;
    }

      const accessToken = Spotify.getAccessToken();
      const headers = {Authorization: `Bearer ${accessToken}`};
      let userId;

      return fetch('https://api.spotify.com/v1/me', {
        headers: headers}).then(response => {
          return response.json()
        }).then(jsonResponse => {
          userId = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({name: name})
          }).then(response => {
            return response.json()
          }).then(jsonResponse => {
            const playlistId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({uris: trackURIs})
            })
          })
        })
  }
}


export default Spotify;
