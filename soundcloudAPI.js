// create socialRank
// which is combined with dateDiff (now - created_at)
// for rank
// sort by rank
var clientID = '212b7a5080f5d7f8e831583446771a02'
var monthMark = new Date()
//var SCmonthMark = '2013-01-01'
var input = {query: '', getQuery: function(){return this.query}, setQuery: function(value){this.query = value; filters.tags = this.query} }
var filters = {
  q: input.getQuery(),
//  limit: 200,
//  created_at: {'from': SCmonthMark +' 00:00:00'}
}

SC.initialize({
  client_id: clientID
})

function getTracks(){
  $('ul.playlist').empty()
  $('ul.playlist').html('<img id="loadGif" src="http://www.traceinternational.org/images/loading4.gif"/>')
  SC.get('/tracks', filters, function(tracks){ //call out to SC servers
    if(tracks['errors']) {
      $('ul.playlist').empty()
      $('ul.playlist').html('<h1>:(</h1>')
      return
    }  
    var dateDiff = 0, dateDiffTotal = 0, dateDiffPercentile = 0, dateDiffWeighting = 8.5
    var tempDate
    var playbackCount = 0, playbackTotal = 0, playbackPercentile = 0, playbackWeighting = 1
    var favoritingsCount = 0, favoritingsTotal = 0, favoritingsPercentile = 0, favoritingsWeighting = 1.5
    var rankScore
    var topSlice = 50
    var stagedTrack
    var tracksLen = tracks.length
    // get and store into tracks[]
    for (var i = 0; i < tracksLen; i++){
      tempDate = (tracks[i].created_at.split(' '))[0].split('/')                             // get the milliseconds of created_at
      tempDate = new Date(tempDate[1] +'/'+ tempDate[2] +'/'+ tempDate[0])                   //
      dateDiff = parseInt((1 / (monthMark - tempDate)) * 100000000000000)                       // ...get 3 fields for algorithm
      playbackCount = tracks[i].playback_count || 1         //
      favoritingsCount = tracks[i].favoritings_count || 1   // 
      dateDiffTotal += dateDiff                             // meanwhile keep the running totals for later use
      playbackTotal += playbackCount                        //
      favoritingsTotal += favoritingsCount                  //
      //get and store pertinent properties for each track
      stagedTrack = tracks[i]
      tracks[i] = {createdAt: stagedTrack.created_at, dateDiff: dateDiff, playbackCount: playbackCount, favoritingsCount: favoritingsCount, title: stagedTrack.title, username: stagedTrack.user.username, streamURL: stagedTrack.stream_url, permalinkURL: stagedTrack.permalink_url, artworkURL: (stagedTrack.artwork_url)? stagedTrack.artwork_url : 'imgs/no_artwork-large.png', downloadURL: stagedTrack.download_url+'?consumer_key='+clientID}
    }
    // run the algorithm to calculate rank
    for (var i = 0; i < tracksLen; i++){
      dateDiffPercentile = (tracks[i]['dateDiff'] / dateDiffTotal) * dateDiffWeighting; console.log(dateDiffPercentile)
      tracks[i]['_dateDiffPercentile'] = (tracks[i]['dateDiff'] / dateDiffTotal) * dateDiffWeighting
      playbackPercentile = (tracks[i]['playbackCount'] / playbackTotal) * playbackWeighting; console.log(playbackPercentile)
      tracks[i]['_playbackPercentile'] = (tracks[i]['playbackCount'] / playbackTotal) * playbackWeighting
      favoritingsPercentile = (tracks[i]['favoritingsCount'] / favoritingsTotal) * favoritingsWeighting; console.log(favoritingsPercentile)
      tracks[i]['_favoritingsPercentile'] = (tracks[i]['favoritingsCount'] / favoritingsTotal) * favoritingsWeighting
      rankScore = parseInt((dateDiffPercentile + playbackPercentile + favoritingsPercentile) * 10000)
      tracks[i]['rank'] = rankScore
    }
    //debug
    console.log(tracks, dateDiffTotal, playbackTotal, favoritingsTotal)
    //sort by rank
    tracks = tracks.sort(sortBy('rank', false, parseInt));
    //slice
    tracks = tracks.slice(0,topSlice)
    $('ul.playlist').empty()
    //render HTML page
    for(var i = 0; i < topSlice; i++){
      stagedTrack = tracks[i]      
      $('ul.playlist').append('<li><a type="audio/mp3" href="'+stagedTrack.streamURL+'?consumer_key='+clientID+'"><div class="albumArt"><img src="'+stagedTrack.artworkURL+'" width="100" height="100"></div><div class="track"><span class="trackTitle">'+stagedTrack.title+'</span> <span class="trackUsername">'+stagedTrack.username+'</span></div><div class="meta"><span class="glyphicon glyphicon-fire"></span> '+numberWithCommas(stagedTrack.rank)+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-calendar"></span> '+dateFormat(stagedTrack.createdAt, "ddd mmm-dS-yyyy")+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-music"></span> '+numberWithCommas(stagedTrack.playbackCount)+' &nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-thumbs-up"></span> '+numberWithCommas(stagedTrack.favoritingsCount)+'</div></a></li>')
    }
  })
}