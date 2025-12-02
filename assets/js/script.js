const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const pageContainer = document.getElementById('page-container');
let clientId
let clientSecret

let isLoading = false;

function handleLoading() {
    isLoading = true
    if (isLoading) {
        searchInput.value = "Loading...";
        searchInput.classList.add("animate-pulse")
        searchInput.classList.add("text-grey-800/25")
        searchInput.classList.add("dark:text-grey-800/25")

        searchBtn.classList.add("opacity-50")
        searchBtn.classList.add("cursor-not-allowed")
        isLoading = false;
        pageContainer.classList.remove("hidden")
        searchInput.classList.remove("animate-pulse")
        searchInput.classList.remove("text-grey-800/25")
        searchInput.classList.remove("dark:text-grey-800/25")
        searchBtn.classList.remove("opacity-50")
        searchBtn.classList.remove("cursor-not-allowed")
        searchInput.value = ""
    } else if (searchInput.length === 0) {
        return
    }
}

async function getSpotifyToken() {
    let url = 'https://accounts.spotify.com/api/token'

    return fetch(url, {
        method: 'POST', 
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" 
            
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    }).then((response)=>{
        console.log(response, '<-- response')
        return response.json()
    }).then((data)=>{

        token = data.access_token

        return token
    })
     
}

async function searchArtist(name) {
    if (name.length === 0) {
        searchBtn.classList.add("disabled")
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
    const artist = data.artists["items"]
    let artistId = data.artists["items"][0].id
    console.log(artistId)
    const trackArray = await searchArtistTracks(artistId, token);
    const albumArray = await searchArtistAlbums(artistId, token);
    console.log(artist[0].external_urls)
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
    return result
   }
}

async function searchArtistTracks(artistId, token) {
    
    const trackArray = []
    const maxResults = 10

    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

    const topTrackResponse = await fetch(topTracksUrl, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    let topTracksData = await topTrackResponse.json()
    console.log(topTracksData)
    topTracksData = topTracksData["tracks"];
        for (let i = 0; i < topTracksData.length && i < maxResults; i++) {
        //console.log(topTracksData[i].name)
        trackArray.push(topTracksData[i].name)
        //console.log(trackArray)
    }
    console.log("Success! <-- searchArtistTracks")
    return trackArray;
}

async function searchArtistAlbums(artistId, token) {
    
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`
    const responseAlbums = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    console.log(responseAlbums, 'Response Albums')
    let albums = await responseAlbums.json()
    if (albums.length !== 0) {
        albums = albums["items"]
    }
    const maxResults = 6;
    const albumArray = []
        for (let i = 0; i < albums.length && i < maxResults; i++) {
        //console.log(albums[i].name)
        albumArray.push(albums[i].name)
        //console.log(albumArray)
    }


}

searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log(searchInput.value)
    if (searchInput.value.trim() !== "") {
        handleLoading()
        console.log(searchInput.value.trim())
        searchArtist(searchInput.value.trim())

    }




})
