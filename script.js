//subscription service to email top 4 tracks per week. ability to follow certain genres

//- rename property names to distinguish from SC's prop names
//- convert various components into functions
//- add attributions acc. to SC's EULA
//- add comment_count in ranking algorithm

var clientID = '212b7a5080f5d7f8e831583446771a02'
var songSet = []
var monthMark = '2013-09-01 09:24:50'
var milliStamp = new Date(monthMark).getTime()
var filters = {
  genres: 'indie',
  limit: 200,
  created_at: {
    'from': monthMark
  },
  filter: 'streamable'
}

SC.initialize({
  client_id: clientID
});

// create songSet array -- make bulk request for tracks
//-- remove tracks with 'undef' stream_url
//-- store them as indiv objects in songSet with all properties
SC.get('/tracks', filters, function(tracks){
    var tracksLen = tracks.length
    for (var i = 0; i < tracksLen; i++){
      if (tracks[i].stream_url === undefined){ //skip over those that don't have stream_url
        continue
      }
      //date difference. '0' means it was created at the exact time of monthMark. The higher the better for rank
      var dateDiff = Math.round(((new Date(tracks[i].created_at).getTime()) - milliStamp)*0.0001)
      var rankScore = Math.round(((dateDiff + tracks[i].playback_count + tracks[i].favoritings_count)/3))
      // get and store all tracks in songSet
      songSet[i] = {created_at: tracks[i].created_at, dateDiff: dateDiff, playback_count: tracks[i].playback_count, favoritings_count: tracks[i].favoritings_count, rank: rankScore, title: tracks[i].title, username: tracks[i].user.username, stream_url: tracks[i].stream_url, permalink_url: tracks[i].permalink_url}
    }

    //render 4 tracks from songSet in HTML document      
    songSet = songSet.sort(sort_by('rank', false, parseInt)); //sort by rank
//    songSet = songSet.slice(0,4) //slice the top 4 tracks
    var songSetLen = songSet.length
    for(var i = 0; i < songSetLen; i++){          //
      $('ul.playlist').append('<li><a type="audio/mp3" href="'+songSet[i].stream_url+'?consumer_key='+clientID+'"><span class="trackRank">'+songSet[i].rank+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackTitle">'+songSet[i].title+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackUsername">'+songSet[i].username+'</span></a></li>')
    }
    console.log(songSet, 'Track count: '+songSetLen) //debugging
})

//Source: http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
function sort_by(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};
   return function (a,b) {
       var A = key(a), B = key(b);
       return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
   }
}
