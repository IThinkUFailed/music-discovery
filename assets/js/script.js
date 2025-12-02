const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
let id
let secret

// getting a token works
// when searching an id we can successfully retrieve our artist name
// neeed to work out how to get artistId from a string name.
// 
async function getSpotifyToken() {
    const clientId = id
    const clientSecret = secret

    let url = 'https://accounts.spotify.com/api/token'

    return fetch(url, {
        method: 'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" 
            
        },
        body: `grant_type=client_credentials&client_id=${id}&client_secret=${secret}`
    }).then((response)=>{
        console.log(response, '<-- response')
        return response.json()
    }).then((data)=>{

        token = data.access_token

        return token
    })
     
}
//fix to search by artist name - dk
// function to convert name to id which then passed to searchArtist below
async function searchArtist(name) {
    if (name.length === 0) {
        console.log("no name provided")
        return
    } else {


    const token = await getSpotifyToken();

    const urlArtist = `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`
    const responseArtist = await fetch(urlArtist, {
        headers: { "Authorization": `Bearer ${token}` }
       } 
    );

   

    const data = await responseArtist.json();
    let artistId = data.artists["items"][0].id
    console.log(artistId)
    const urlAlbums = `https://api.spotify.com/v1/artists/${artistId}/albums`
    const responseAlbums = await fetch(urlAlbums, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    console.log(responseAlbums, 'Response Albums')
    if (data.artists.items.length === 0) {
        console.log("Returned nothing")
    }

    const artist = data.artists["items"]
    let albums = await responseAlbums.json()
    if (albums.length !== 0) {
        albums = albums["items"]
    }
    // Object.entries(albums).forEach(([key, value]) => {
    //     console.log(key, 'key', value, 'value')
    // })
    const albumArray = []
    const trackArray = []
    const maxResults = 6;
    for (let i = 0; i < albums.length && i < maxResults; i++) {
        console.log(albums[i].name)
        albumArray.push(albums[i].name)
        console.log(albumArray)
    }

    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

    const topTrackResponse = await fetch(topTracksUrl, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    let topTracksData = await topTrackResponse.json()
    console.log(topTracksData)
    topTracksData = topTracksData["tracks"];
        for (let i = 0; i < topTracksData.length; i++) {
        console.log(topTracksData[i].name)
        trackArray.push(topTracksData[i].name)
        console.log(trackArray)
    }
    
    // console.log(artist, 'Artist')
    // console.log(data.artists, 'Artists')
    // console.log(artist[0].name, 'Artist Name') // retrieves name
    // console.log(artist[0].id, 'Artist ID')
    // console.log(artist[0].genres, 'Genres')
    // console.log(artist[0].followers, 'Artist followers')
    // console.log(albums 'albums')

    // for (const album of albums) {
    //     console.log(albuum)
    // }

    const result = {
        name: artist[0].name,
        id: artist[0].id,
        img: artist[0].images,
        genres: artist[0].genres,
        followers: artist[0].followers,
        albums: albumArray,
        spotify: artist[0].external_urls.spotify,
        topTracks: trackArray
    } 
   }
    console.log(result)
    return result
}

searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    console.log(searchInput.value.trim())
    getSpotifyToken()
    searchArtist(searchInput.value.trim())



})
