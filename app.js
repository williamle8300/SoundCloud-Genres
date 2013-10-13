var clientID = '212b7a5080f5d7f8e831583446771a02'
var songSet = []
var monthMark = '2013-09-10 09:24:50'
var milliMonthMark = new Date(monthMark).getTime()
var input = {query: '', getQuery: function(){return this.query}, setQuery: function(value){this.query = value; filters.tags = this.query} }

var filters = {
  q: input.getQuery(),
// limit: 200,
//  created_at: {'from': monthMark},
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
  //load first songSet
  getTracks()
})()

//Get and store tracks from SoundCloud in songSet
function getTracks(){
  $('ul.playlist').empty()
  $('ul.playlist').html('<img id="loadGif" src="http://bradsknutson.com/wp-content/uploads/2013/04/page-loader.gif"/>')
  SC.get('/tracks', filters, function(tracks){
    var dateDiff, dateDiffTotal, dateDiffPercentile, dateDiffWeighting = '70%'
    var playbackCount, playbackTotal, playbackPercentile, playbackWeighting = '100%'
    var favoritingsCount, favoritingsTotal, favoritingsPercentile, favoritingsWeighting = '100%'
    var rankScore
    var tracksLen = tracks.length
    for (var i = 0; i < tracksLen; i++){
      //if(tracks[i].stream_url === undefined) continue //skip over those that don't have stream_url
      //ranking algorithm
      dateDiff = Math.round((new Date(tracks[i].created_at).getTime()) - milliMonthMark) //get pertinent track info for algorithm //milliseconds between milliMonthMark and created_at
      playbackCount = tracks[i].playback_count //
      favoritingsCount = tracks[i].favoritings_count //
      dateDiffTotal += dateDiff //create running totals
      playbackTotal += playbackCount //
      favoritingsTotal += favoritingsCount //
      // store all tracks in songSet
      songSet[i] = {createdAt: tracks[i].created_at, dateDiff: dateDiff, playbackCount: playbackCount, favoritingsCount: favoritingsCount, title: tracks[i].title, username: tracks[i].user.username, streamURL: tracks[i].stream_url, permalinkURL: tracks[i].permalink_url}
    }
    var songSetLen = songSet.length
    for (var i = 0; i < songSetLen; i++){
      dateDiffPercentile = (songSet[i]['dateDiff'] / dateDiffTotal)
      playbackPercentile = (songSet[i]['playbackCount'] / playbackTotal)
      favoritingsPercentile = (songSet[i]['favoritingsCount'] / favoritingsTotal)
      rankScore = dateDiffPercentile + playbackPercentile + favoritingsPercentile
      songSet[i]['rank'] = rankScore
    }
    //sort tracks by rank
    songSet = songSet.sort(sortBy('rank', false, parseInt));
//    songSet = songSet.slice(0,4) //slice the top 4 tracks
    $('ul.playlist').empty()
    for(var i = 0; i < songSetLen; i++){          //
      $('ul.playlist').append('<li><a type="audio/mp3" href="'+songSet[i].streamURL+'?consumer_key='+clientID+'"><span class="trackRank">'+songSet[i].rank+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackTitle">'+songSet[i].title+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="trackUsername">'+songSet[i].username+'</span></a></li>')
    }
    console.log(songSet, 'Track count: '+songSetLen) //debugging
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