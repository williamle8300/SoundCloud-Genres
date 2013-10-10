$(function(){

  $.ajax({
  		url: "http://www.reddit.com/api/info.json?&url=http://thecavegame.com/",
  		jsonp: "jsonp",
      dataType: "jsonp",
      success: function foo(data) { 
        $.each(
          data.data.children.slice(0, 100),
          function (i, post) {
            $("body").append( '<h4>' + post.data.title + '</h4>');
            $("body").append( '<p>' + post.data.url );
            $("body").append( '<p>' + post.data.permalink );
            $("body").append( '<p>' + post.data.ups );
            $("body").append( '<p>' + post.data.downs );
            $("body").append( '<hr>' );
          }
        )
      }
    })

})    