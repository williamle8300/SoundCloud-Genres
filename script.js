var clientID = '212b7a5080f5d7f8e831583446771a02'
var songSet = []
var monthMark = '2013-09-10 09:24:50'
var milliStamp = new Date(monthMark).getTime()
var input = {genres: '', getGenres: function(){return this.genres}, setGenres: function(value){this.genres = value; filters.tags = this.genres} }

var filters = {
  tags: input.getGenres(),
  limit: 200,
//  limit: 10,
  created_at: {'from': monthMark},
  filter: 'streamable'
}

//start SC with client_id
SC.initialize({
  client_id: clientID
})

//Put listeners here
$(function() {
  $("button#userQuery").click(function() {
    var userPrompt = $(this).text()
  	var inputbox = "<input id='queryBox' value=\""+userPrompt+"\">"
  	$(this).html(inputbox)
  	$("input#queryBox").keyup(function(e) {
      if(e.which == 13) { // Enter key
        	$("input#queryBox").blur(function() {
        		var value = $(this).val()
            input.setGenres(value)
            getTracks()
        		$("button#userQuery").text(value)
        	})
          $(this).blur()
      }    
    })
  	$("input#queryBox").focus()
  	$("input#queryBox").blur(function() {
      $(this).hide()
      $("button#userQuery").text(userPrompt)
  	})
  })
})

;(function init(){
  //let user provide userGenres
  document.onkeypress = function(e) {
      e = e || window.event
      var charCode = (typeof e.which == "number") ? e.which : e.keyCode
      if(String.fromCharCode(charCode) === "#") {
          //input.setGenres(prompt("Type out the genre:"))
          $('button#userQuery').click()
      }
  }
  //load first songSet
  getTracks()
})()

//Get and store tracks from SoundCloud in songSet
function getTracks(){
  $('ul.playlist').empty()
  SC.get('/tracks', filters, function(tracks){
      var tracksLen = tracks.length
      for (var i = 0; i < tracksLen; i++){
        if(tracks[i].stream_url === undefined){ //skip over those that don't have stream_url
          continue
        }
        //date difference. '0' means it was created at the exact time of monthMark. The higher the better for rank
        var dateDiff = Math.round(((new Date(tracks[i].created_at).getTime()) - milliStamp)*0.0001)
        var rankScore = Math.round(((dateDiff + tracks[i].playback_count + tracks[i].favoritings_count)/3))
        // get and store all tracks in songSet
        songSet[i] = {createdAt: tracks[i].created_at, dateDiff: dateDiff, playbackCount: tracks[i].playback_count, favoritingsCount: tracks[i].favoritings_count, rank: rankScore, title: tracks[i].title, username: tracks[i].user.username, streamURL: tracks[i].stream_url, permalinkURL: tracks[i].permalink_url}
      }

      //render 4 tracks from songSet in HTML document      
      songSet = songSet.sort(sortBy('rank', false, parseInt)); //sort by rank
  //    songSet = songSet.slice(0,4) //slice the top 4 tracks
      var songSetLen = songSet.length
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