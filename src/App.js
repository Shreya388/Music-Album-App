import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card, Navbar, Nav } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = "48ae137df32944318d5cefa8cba7131f";
const CLIENT_SECRET = "e348c6e88adb4859bc53f914310d5b19";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    // API Access Token
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => console.error('Error obtaining access token:', error));
  }, []);

  // Search
  async function search() {
    try {
      console.log("Search for " + searchInput);

      if (!accessToken) {
        console.log("Access token is not available yet. Waiting for it...");
        return;
      }

      // Get request using search to get the artist id
      const searchParameters = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      };

      const searchResponse = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters);
      const searchData = await searchResponse.json();

      // Assuming the first item in the search results is the artist
      const artistID = searchData.artists.items[0]?.id;

      if (!artistID) {
        console.log("Artist ID not found");
        return;
      }

      console.log("Artist ID is " + artistID);

      // Get request with artist id to grab all the albums from that artist
      const albumsResponse = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters);
      const albumsData = await albumsResponse.json();

      setAlbums(albumsData.items || []);

      // Display those albums to the user
      console.log(albumsData);
    } catch (error) {
      console.error('Error during search:', error);
    }
  }

  return (
    <div className="App">
      <Navbar className='topbar fixed-top pt-3 pb-3'>
        <Container>
          <Navbar.Brand className='text-white'>LOGO</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto mx-auto">
            <Nav.Link href="#home">Trending</Nav.Link>
            <Nav.Link href="#link">Famous</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="header text-white text-center">
      <Container>
        <div className='p-4'>
        <h1>Listen to Your<br /> Favorite Albums</h1>
        <p>Explore Millions of Songs</p>
        </div>

        <InputGroup className="" size="lg">
          <FormControl
            placeholder="Search for album"
            type="input"
            className='searchbox'
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search} className='searchbtn'>
            Search
          </Button>
        </InputGroup>
      </Container>
      </div>
      <Container>
        <Row className="mx-2 mt-4 row row-cols-3">
          {albums.map(album => (
            <Card key={album.id} className='items mt-4 border-0'>
              <Card.Img src={album.images[0]?.url || "#"} />
              <Card.Body>
                <Card.Title>{album.name}</Card.Title>
                <p>{album.album_type}</p>

                <a href={album.external_urls.spotify}>Listen</a>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default App;
