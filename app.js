var clientID = '212b7a5080f5d7f8e831583446771a02'
var monthMark = new Date()
var input = {query: '', getQuery: function(){return this.query}, setQuery: function(value){this.query = value; filters.tags = this.query} }
var filters = {q: input.getQuery(),}

SC.initialize({
  client_id: clientID
})

//Initialize app
$(function() {
  crunchShortcut()
  queryBoxListener()
  getTracks(sortingAlgorithm)
})

function getTracks(action){
  $('ul.playlist').empty()
  $('ul.playlist').html('<img id="loadGif" src="http://www.traceinternational.org/images/loading4.gif"/>')
  SC.get('/tracks', filters, action)
}

function sortingAlgorithm(data){
  if(data['errors']) {
    $('ul.playlist').html('<h1>:(</h1>')
    return
  }
  var dateDiff = 0, dateDiffTotal = 0, dateDiffPercentile = 0, dateDiffWeighting = 8.5
  var tempDate
  var playbackCount = 0, playbackTotal = 0, playbackPercentile = 0, playbackWeighting = 1
  var favoritingsCount = 0, favoritingsTotal = 0, favoritingsPercentile = 0, favoritingsWeighting = 1.5
  var rankScore
  var stagedTrack
  var dataLen = data.length
  // get and store into data[]
  for (var i = 0; i < dataLen; i++){
    tempDate = (data[i].created_at.split(' '))[0].split('/')                    // get the milliseconds of created_at
    tempDate = new Date(tempDate[1] +'/'+ tempDate[2] +'/'+ tempDate[0])          //
    dateDiff = parseInt((1 / (monthMark - tempDate)) * 100000000000000)           // ...get 3 fields for algorithm
    playbackCount = data[i].playback_count || 1                                 //
    favoritingsCount = data[i].favoritings_count || 1                           // 
    dateDiffTotal += dateDiff                                                     // meanwhile keep the running totals for later use
    playbackTotal += playbackCount                                                //
    favoritingsTotal += favoritingsCount                                          //
    //get and store pertinent properties for each track                           
    stagedTrack = data[i]
    data[i] = {createdAt: stagedTrack.created_at, dateDiff: dateDiff, playbackCount: playbackCount, favoritingsCount: favoritingsCount, title: stagedTrack.title, username: stagedTrack.user.username, streamURL: stagedTrack.stream_url, permalinkURL: stagedTrack.permalink_url, artworkURL: (stagedTrack.artwork_url)? stagedTrack.artwork_url : 'imgs/no_artwork-large.png', downloadURL: stagedTrack.download_url+'?consumer_key='+clientID}
  }
  // run the algorithm to calculate rank
  for (var i = 0; i < dataLen; i++){
    //date
    dateDiffPercentile = (data[i]['dateDiff'] / dateDiffTotal) * dateDiffWeighting; console.log(dateDiffPercentile)
    data[i]['_dateDiffPercentile'] = (data[i]['dateDiff'] / dateDiffTotal) * dateDiffWeighting
    //playbacks
    playbackPercentile = (data[i]['playbackCount'] / playbackTotal) * playbackWeighting; console.log(playbackPercentile)
    data[i]['_playbackPercentile'] = (data[i]['playbackCount'] / playbackTotal) * playbackWeighting
    //favorites
    favoritingsPercentile = (data[i]['favoritingsCount'] / favoritingsTotal) * favoritingsWeighting; console.log(favoritingsPercentile)
    data[i]['_favoritingsPercentile'] = (data[i]['favoritingsCount'] / favoritingsTotal) * favoritingsWeighting
    //now use to calculate rankScore
    rankScore = parseInt((dateDiffPercentile + playbackPercentile + favoritingsPercentile) * 10000)
    data[i]['rank'] = rankScore
  }
  //debug
  console.log(data, dateDiffTotal, playbackTotal, favoritingsTotal)
  renderHTML(data)
}

function renderHTML(data){
  data = data.sort(sortBy('rank', false, parseInt)); //using utility function sortBy...
  data = data.slice(0,50)
  $('ul.playlist').empty()
  //render each track
  dataLen = data.length
  for(var i = 0; i < dataLen; i++){
    stagedTrack = data[i]      
    $('ul.playlist').append('<li><a type="audio/mp3" href="'+stagedTrack.streamURL+'?consumer_key='+clientID+'"><div class="albumArt"><img src="'+stagedTrack.artworkURL+'" width="100" height="100"></div><div class="track"><span class="trackTitle">'+stagedTrack.title+'</span> <span class="trackUsername">'+stagedTrack.username+'</span></div><div class="meta"><span class="glyphicon glyphicon-fire"></span> '+numberWithCommas(stagedTrack.rank)+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-calendar"></span> '+dateFormat(stagedTrack.createdAt, "ddd mmm-dS-yyyy")+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-music"></span> '+numberWithCommas(stagedTrack.playbackCount)+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-up"></span> '+numberWithCommas(stagedTrack.favoritingsCount)+'</div></a></li>')
  }
}