function crunchShortcut(){
  document.onkeypress = function(e) {
      e = e || window.event
      var charCode = (typeof e.which == 'number') ? e.which : e.keyCode
      if(String.fromCharCode(charCode) === '#') {
        event.preventDefault()
        $('div#userQuery').click()
      }
  }
}
function queryBoxListener(){
  $("div#userQuery").click(function() {
    var userPrompt = $(this).text()
  	var inputBox = '<input id="queryBox" value="'+userPrompt+'">'
  	$(this).html(inputBox)
  	$('input#queryBox').keyup(function(e) {
      if(e.which == 13) { // Enter key
          var value
          if($(this).val()){
            value = $(this).val().toLowerCase()
          }
          else {value = userPrompt}
        	$('input#queryBox').blur(function() {
            input.setQuery(value)
            getTracks(sortingAlgorithm) //get the tracks and use the sortingAlgorithm
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
}
