var counter = 0;
function changeBG(){
    var imgs = [
		"url(https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80)",
        "url(https://images.unsplash.com/photo-1547153388-cb6959ce1a56?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)",
        "url(https://images.unsplash.com/photo-1554289087-51d078c78d8a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)",
		"url(https://images.unsplash.com/photo-1538584797384-59551a9e38be?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)",
        "url(https://images.unsplash.com/photo-1527244801394-a5594462a962?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)",
        "url(https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)",
		"url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80)"
      ]
    
    if(counter === imgs.length) counter = 0;
    $("body").css("background-image", imgs[counter]);
	
    counter++; 
}
  
  setInterval(changeBG, 5000);
