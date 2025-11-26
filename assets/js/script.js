const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
let id = '0b814e9a11ed46b5b2c9e391dbfa245f';
let secret = '9547a42e9ccf4c3bb7f23a22f6baa304';

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
    const token = await getSpotifyToken();

    const url = `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`
    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
       } 
    );

    const data = await response.json();

    if (data.artists.items.length === 0) {
        console.log("Returned nothing")
    }

    const artist = data.artists["items"]
    console.log(artist[0].name) // retrieves name

    return {
        name: artist.name,
        id: artist.id,
        genres: artist.genres,
        followers: artist.followers,
        albums: artist.albums,
    }
}

searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    console.log(searchInput.value.trim())
    getSpotifyToken()
    searchArtist(searchInput.value.trim())



})
