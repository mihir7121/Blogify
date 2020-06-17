var counter = 0;

function changeHeading(){
	var h1 = document.getElementById("slideSource");
	var heading = [
		"Welcome to Blogify!",
		"Let's get started",
		"Let's get started",
        "Lifestyle News",
        "Lifestyle News",
      ];
	if(counter === heading.length) counter = 0;
	
    if(h1.classList.contains("fade")){
        h1.classList.remove("fade");
    } else {
        h1.classList.add("fade");
    }
	h1.textContent = heading[counter];
    counter++; 
}

setInterval(changeHeading, 4000);
