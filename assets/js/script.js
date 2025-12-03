const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const pageContainer = document.getElementById('page-container');
const similarArtistsDiv = document.getElementById('similar-artists');
const artistAlbumsDiv = document.getElementById('artist-albums')
const topTracksDiv = document.getElementById('tracks')
const followersEl = document.getElementById('followers')
const followerSvg = document.getElementById('followersvg')
const popularityEl = document.getElementById('popularity')
const artistNameEl = document.getElementById('artist-name')
const artistImg = document.getElementById('artist-img')

let clientId;
let clientSecret;
let tasteDiveApiKey;


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
        // console.log(response, '<-- response')
        return response.json()
    }).then((data)=>{

        token = data.access_token

        return token
    })
     
}

async function searchArtist(name) {
    handleLoading()
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
    
   const similarArtists = await findSimilarArtists(name);
    // console.log(similarArtists)
    const data = await responseArtist.json();
    const artist = data.artists["items"]
    let artistId = data.artists["items"][0].id
    // console.log(artistId)
    const trackArray = await searchArtistTracks(artistId, token);
    const albumArray = await searchArtistAlbums(artistId, token);
    const result = {
        name: artist[0].name,
        id: artist[0].id,
        img: artist[0].images,
        followers: artist[0].followers,
        popularity: artist[0].popularity,
        albums: albumArray,
        spotify: artist[0].external_urls.spotify,
        topTracks: trackArray,
        similarArtists: similarArtists
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
    // console.log("Success! <-- searchArtistTracks")
    return trackArray;
}

async function searchArtistAlbums(artistId, token) {
    
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`
    const responseAlbums = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    })

    // console.log(responseAlbums, 'Response Albums')
    let albums = await responseAlbums.json()
    if (albums.length !== 0) {
        albums = albums["items"]
    }
    const maxResults = 10;
    const albumArray = []
        for (let i = 0; i < albums.length; i++) {
        // console.log(albums[i].name)
        albumArray.push(albums[i].name)
    }
 return albumArray


}

async function findSimilarArtists(artistName) {

const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(`https://tastedive.com/api/similar?q=${artistName}&type=music&k=${tasteDiveApiKey}`);
const maxResults = 6;
const artistsArray = []
const response = await fetch(proxyUrl);
// console.log(proxyUrl)
const similarArtists = await response.json()

// console.log(similarArtists["similar"]["results"])
for (let i = 0; i < maxResults; i++) {
    // console.log(similarArtists["similar"]["results"][i])
    artistsArray.push(similarArtists["similar"]["results"][i])
    // console.log(artistsArray)
}

return similarArtists

}

async function renderCards(name) {
const maxResults = 10;
let br = document.createElement("br")
let olSimilar = document.getElementById("artists-list")
let olAlbums = document.getElementById("album-list")
let li = document.createElement("li")
let data = await searchArtist(name)
let similarArtists = data.similarArtists.similar.results
console.log(data.img)
// Set Artist Card Details
artistImg.src = data.img[0].url
// Set Name

artistNameEl.innerText = data.name

// Set Followers
followersEl.innerText = data.followers.total += ' followers.'
followersEl.classList.add("icon")
followersEl.classList.add("block")
followersEl.setAttribute("alt", "Followers")

// Set Artist Picture


// Set Populariy
popularityEl.classList.add("icon")
popularityEl.classList.add("block")
popularityEl.setAttribute("alt", "Popularity")
  popularityEl.textContent = data.popularity

console.log(data.followers,'<-- followers?')
for (let i = 0; i < maxResults; i++ ) {
    // console.log(data.topTracks)
    let newLi = document.createElement("li");
    newLi.textContent = similarArtists[i].name
    similarArtistsDiv.append(newLi)

}
for (let j = 0; j < maxResults; j++) {
    let newLi = document.createElement("li");
    newLi.textContent = data.albums[j]
    artistAlbumsDiv.append(newLi)
}

for (let k = 0; k < maxResults; k++) {
    let newLi = document.createElement("li");
    newLi.textContent = data.topTracks[k]
    topTracksDiv.append(newLi)
}
}

function resetCards(){
    similarArtistsDiv.innerHTML = '<h4><strong>Similar Artists</strong></h4><br>';
    artistAlbumsDiv.innerHTML = "<h4><strong>Albums</strong></h4><br>";
    topTracksDiv.innerHTML = "<h4><strong>Top Tracks</strong></h4><br>";
    followersEl.innerText = ''
    popularityEl.innerText = ''

}


searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        // console.log(searchInput.value)
    if (searchInput.value.trim() !== "") {
        resetCards()
        // console.log(searchInput.value.trim())
        renderCards(searchInput.value.trim())
        // searchArtist(searchInput.value.trim())

    }
})

searchBtn.addEventListener('click', function (event) {
        event.preventDefault();
        // console.log(searchInput.value)
    if (searchInput.value.trim() !== "") {
        // console.log(searchInput.value.trim())
        searchArtist(searchInput.value.trim())

    }




})
