//find the best songs on soundcloud and enjoy it!
//also offers subscription service to email top 4 tracks per week. ability to follow certain genres

//- convert various components into functions
//- add attributions acc. to SC's EULA
//- add comment_count in ranking algorithm?

var clientID = '212b7a5080f5d7f8e831583446771a02'
var songSet = []
var monthMark = '2013-09-10 09:24:50'
var milliStamp = new Date(monthMark).getTime()
var input = {genres: '', getGenres: function(){return this.genres}, setGenres: function(value){this.genres = value; filters.genres = this.genres; getTracks()} }

var filters = {
  genres: input.getGenres(),
  limit: 10,
  created_at: {'from': monthMark},
  filter: 'streamable'
}

//start SC with client_id
SC.initialize({
  client_id: clientID
})

//Place all DOM listeners in here
$(function() {
	
  //When div.edit me is clicked, run this function
	$("#userQuery").click(function() {
		//This if statement checks to see if there are 
		//and children of div.editme are input boxes. If so,
		//we don't want to do anything and allow the user
		//to continue typing
		if ($(this).children('input').length == 0) {
		
			//Create the HTML to insert into the div. Escape any " characters 
			var inputbox = "<input type='text' id='inputUserQuery' value=\""+$(this).text()+"\">"
			
			//Insert the HTML into the div
			$(this).html(inputbox)

			//add listener when user clicks enter
			$("#inputUserQuery").keyup(function(e) {
              if (e.which == 13) // Enter key
                  $(this).blur()
      })
      
			//Immediately give the input box focus. The user
			//will be expecting to immediately type in the input box,
			//and we need to give them that ability
			$("input#inputUserQuery").focus()
			
			//Once the input box loses focus, we need to replace the
			//input box with the current text inside of it.
			$("input#inputUserQuery").blur(function() {
				var value = $(this).val()
				$("#userQuery").text(value)
			})
		}
	})
})

;(function init(){
  //let user provide userGenres
  document.onkeypress = function(e) {
      e = e || window.event
      var charCode = (typeof e.which == "number") ? e.which : e.keyCode
      if (String.fromCharCode(charCode) === "#") {
          input.setGenres(prompt("Type out the genre:"))
      }
  }
  //load first songSet
  getTracks()
})()

// create songSet array -- make bulk request for tracks
//-- remove tracks with 'undef' stream_url
//-- store them as indiv objects in songSet with all properties
function getTracks(){
  $('ul.playlist').empty()
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