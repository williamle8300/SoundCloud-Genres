// create socialRank
// which is combined with dateDiff (now - created_at)
// for rank
// sort by rank


var clientID = '212b7a5080f5d7f8e831583446771a02'
var tracks = []
var monthMark = new Date('09-10-2013')
var SCmonthMark = '2013-09-10'
var input = {query: '', getQuery: function(){return this.query}, setQuery: function(value){this.query = value; filters.tags = this.query} }

var filters = {
//  q: input.getQuery(),
  tags: input.getQuery(),
//  limit: 200, //comment-out to let SC deal the hand
//  created_at: {'from': SCmonthMark +' 00:00:00'},
//  filter: 'streamable'
}

//start SC with client_id
SC.initialize({
  client_id: clientID
})

//Put listeners here
$(function() {
  $("div#userQuery").click(function() {
    var userPrompt = $(this).text()
  	var inputBox = '<input id="queryBox" value="'+userPrompt+'">'
  	$(this).html(inputBox)
  	$('input#queryBox').keyup(function(e) {
      if(e.which == 13) { // Enter key
          var value
          if($(this).val()){
            value = $(this).val()
          }
          else {value = userPrompt}
        	$('input#queryBox').blur(function() {
            input.setQuery(value)
            getTracks()
        		$('div#userQuery').text(value)
        	})
          $(this).blur()
      }    
    })
  	$('input#queryBox').focus()
  	$('input#queryBox').blur(function() {
      $(this).hide()
      $('div#userQuery').text(userPrompt)
  	})
  })
})

;(function init(){
  //let user provide userQuery
  document.onkeypress = function(e) {
      e = e || window.event
      var charCode = (typeof e.which == 'number') ? e.which : e.keyCode
      if(String.fromCharCode(charCode) === '#') {
        event.preventDefault()
        $('div#userQuery').click()
      }
  }
  // load initial tracks
  getTracks()
})()

//Get and store tracks from SoundCloud
function getTracks(){
  $('ul.playlist').empty()
  $('ul.playlist').html('<img id="loadGif" src="http://bradsknutson.com/wp-content/uploads/2013/04/page-loader.gif"/>')
  SC.get('/tracks', filters, function(tracks){ //call out to SC servers
    var dateDiff = 0, dateDiffTotal = 0, dateDiffPercentile = 0, dateDiffWeighting = 1
    var tempDate
    var playbackCount = 0, playbackTotal = 0, playbackPercentile = 0, playbackWeighting = 1
    var favoritingsCount = 0, favoritingsTotal = 0, favoritingsPercentile = 0, favoritingsWeighting = 1
    var rankScore
    var stagedTrack
    var tracksLen = tracks.length
    for (var i = 0; i < tracksLen; i++){
      //ranking algorithm
      tempDate = (tracks[i].created_at.split(' '))[0].split('/')                             // get the milliseconds of created_at
      tempDate = new Date(tempDate[1] +'/'+ tempDate[2] +'/'+ tempDate[0])                   //
      dateDiff = tempDate - monthMark                       // ...get 3 fields for algorithm
      playbackCount = tracks[i].playback_count || 1         //
      favoritingsCount = tracks[i].favoritings_count || 1   // 
      dateDiffTotal += dateDiff                             // meanwhile keep the running totals for later use
      playbackTotal += playbackCount                        //
      favoritingsTotal += favoritingsCount                  //
      //get and store pertinent properties for each track
      stagedTrack = tracks[i]
      tracks[i] = {createdAt: stagedTrack.created_at, dateDiff: dateDiff, playbackCount: playbackCount, favoritingsCount: favoritingsCount, title: stagedTrack.title, username: stagedTrack.user.username, streamURL: stagedTrack.stream_url, permalinkURL: stagedTrack.permalink_url, artworkURL: stagedTrack.artwork_url}
    }
    for (var i = 0; i < tracksLen; i++){
      dateDiffPercentile = (tracks[i]['dateDiff'] / dateDiffTotal) * dateDiffWeighting; console.log(dateDiffPercentile)
      playbackPercentile = (tracks[i]['playbackCount'] / playbackTotal) * playbackWeighting; console.log(playbackPercentile)
      favoritingsPercentile = (tracks[i]['favoritingsCount'] / favoritingsTotal) * favoritingsWeighting; console.log(favoritingsPercentile)
      rankScore = (dateDiffPercentile + playbackPercentile + favoritingsPercentile) * 100000000000000
      tracks[i]['rank'] = rankScore
    }
    console.log(tracks, dateDiffTotal, playbackTotal, favoritingsTotal) //debug
    //sort tracks by rank
    tracks = tracks.sort(sortBy('rank', false, parseInt));
    tracks = tracks.slice(0,20) //slice the top 8 tracks
    $('ul.playlist').empty()
    for(var i = 0; i < tracksLen; i++){          //
      $('ul.playlist').append('<li><a type="audio/mp3" href="'+tracks[i].streamURL+'?consumer_key='+clientID+'"><span class="trackRank">'+tracks[i].rank+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackTitle">'+tracks[i].title+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackUsername">'+tracks[i].username+'</span></a></li>')
    }
    console.log(tracks, 'Track count: '+tracksLen) //debugging
  })
}

//Source: http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
function sortBy(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]}
   return function (a,b) {
       var A = key(a), B = key(b)
       return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
   }
}