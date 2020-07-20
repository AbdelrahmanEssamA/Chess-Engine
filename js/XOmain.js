/*Abdelrahman Essam 155295
    Marwan Mohamed 152282*/



var boxes = document.querySelectorAll('.box');
reset();


function reset()
{
	document.querySelector(".endMessage .text").innerHTML = "";
    XOgameBoard=[0,1,2,3,4,5,6,7,8];
    //reset all boxes when replay is pressed
	for (var i = 0; i < boxes.length; i++) {
		boxes[i].innerHTML = '';
		boxes[i].addEventListener('click', SwitchTurn, false);
	}
}
