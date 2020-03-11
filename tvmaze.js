/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

const MISSING_IMAGE = "https://tinyurl.com/tv-missing";

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {

  let show = await axios.get('http://api.tvmaze.com/search/shows',
    { params: { q: query } }
  );

  let showObj = [];

  for (let i=0; i<show.data.length; i++) {
    let showImage = show.data[i].show.image ? show.data[i].show.image.original : MISSING_IMAGE;
    
    showObj.push({
      id: show.data[i].show.id,
      name: show.data[i].show.name,
      summary: show.data[i].show.summary,
      image: showImage  
    })
  }

  return showObj;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {

    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <img class="card-img-top" src="${show.image}">
             <button id=${show.id}>Show Episodes</button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($item);

    $(`#${show.id}`).on('click', buttonHandler);  
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  // Show the episode-area (initially hidden - none)
  $("#episodes-area").show();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  let episodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return episodes.data;
}

function populateEpisodes (episodes) {
  let episodeList = $('#episodes-list');

  for (let i=0; i<episodes.length; i++) {
    let episode = $(`<li>${episodes[i].name} (season ${episodes[i].season}, number ${episodes[i].number})</li>`);
    episodeList.append(episode);
  }
}

async function buttonHandler (evt) {
  $('#episodes-list').empty();

  let domEpisodes = await getEpisodes(evt.target.id);
  // console.log(domEpisodes);
  populateEpisodes(domEpisodes);
}