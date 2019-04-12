// link to my database
var database = firebase.database();

//array to hold all my train objects
var railYard = [];

//variable to hold calculated schedule data
var nextTime = "";
var nextMin = "";

//timer ID
var intervalID;

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
	
	$("#addTrain").text("Add");
	$("#modalHeader").text("Add Train");
	$("#name-input").val("");
	$("#destination-input").val("");
	$("#firstTrainTime-input").val("");
	$("#freq-input").val("");
	$("#addTrain").attr("data-ID", "");

	modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		hideModal();
		//	modal.style.display = "none";
	}
}

//update the schedule every minute
intervalId = setInterval(updateTimer, 60000);

function updateTimer() {
	$(".train").remove();
	railYard.forEach(function (elem) {
		updateTable(elem);
	});
}

//remove train from the schedule
$(document.body).on("click", ".remove", function () {
	var ID = $(this).attr("data-ID");

	//remove train from the database
	var dbDelete = database.ref(ID);
	dbDelete.remove();

	//remove the all trains from the display
	$(".train").remove();

	//remove my train from the array if it is not my train
	//send t tot he display
	railYard.forEach(function (elem) {
		if (elem.ID != ID) {
			//not my train so display it
			updateTable(elem);
		} else {
			//my train so remove it
			railYard.splice(railYard.indexOf(elem), 1);
		}
	});
});

//Update a train
$(document.body).on("click", ".update", function () {
	//update

	//get the train we want to change from the DB
	var ID = $(this).attr("data-ID");
	//change the text on the modal so the user knows 
	//that we are changing not adding 
	$("#addTrain").text("Update");
	$("#modalHeader").text("Update Train");

	//find the train I want to work on in the array
	railYard.forEach(function (elem) {
		if (elem.ID == ID) {
			//grab the data from the objecy in railYard 
			//and display it in the Modal
			$("#name-input").val(elem.name);
			$("#destination-input").val(elem.destination);
			$("#firstTrainTime-input").val(elem.firstTrainTime);
			$("#freq-input").val(elem.freq);
			$("#addTrain").attr("data-ID", ID);
			//display the Modal
			modal.style.display = "block";
		}
	});
});

//calculate the next arrival and the minutes until that arrival
function getNext(start, freq) {
	var n = new Date();
	trainStart = moment(start, "HH:mm");
	var diff = moment(n).diff(trainStart, 'minutes');
	if (diff > 0) {
		nextMin = freq - (diff % freq);
		nextTime = moment(n).add(nextMin, "minute").format("HH:mm");
	} else {
		nextTime = start;
		nextMin = trainStart.diff(moment(n), "minutes");
	}
	if(nextMin==NaN){
		nextMin="";
	}
	if(nextTime==NaN){
		nextTime="";
	}
}
//}
//timer that fires every minute
//update all trains in table
function updateTable(currentLoco) {
	var colorText = "";
	var ID = currentLoco.ID
	var htmlStr = '<td id="name-' + ID + '">' + currentLoco.name + '</td>';

	getNext(currentLoco.firstTrainTime, currentLoco.freq);
	if (nextMin >=20) {
		colorText = "greenText"
	} else {
		if (nextMin >= 10) {
			colorText = "yellowText"
		} else {
			colorText = "redText"
		}
	}
	htmlStr = htmlStr + '<td id="dest-' + ID + '">' + currentLoco.destination + '</td>'
	htmlStr = htmlStr + '<td id="freq-' + ID + '" class="' + colorText + '">' + currentLoco.freq + '</td>';
	htmlStr = htmlStr + '<td id="next-' + ID + '" class="' + colorText + '">' + nextTime + '</td>';
	htmlStr = htmlStr + '<td id="min-' + ID + '" class="' + colorText + '">' + nextMin + '</td>';
	htmlStr = htmlStr + '<td><button data-id="' + currentLoco.ID + '" class="update"> Update </button></td>';
	htmlStr = htmlStr + '<td><button data-id="' + currentLoco.ID + '" class="remove"> Remove </button></td>';
	var tr = $("<tr>").html(htmlStr);
	tr.addClass("train");
	$("#trainTable").append(tr);
}


// on child added
database.ref().on("child_added", function (childSnapshot) {
	//grab a snapsot of the database
	var train = childSnapshot.val();

	//calculate next arrival and minutes away
	var loco = {
		ID: "",
		name: "",
		destination: "",
		firstTrainTime: "",
		freq: "",
	}
	//create the train object
	loco.ID = childSnapshot.key;
	loco.name = train.name;
	loco.destination = train.destination;
	loco.firstTrainTime = train.firstTrainTime;
	loco.freq = train.freq;

	//put train object in the array
	railYard.push(loco);

	//update the display
	updateTable(loco);
});

// onclick addTrain
$("#addTrain").click(function (event) {
	//grab the data from the modal
	var name = $("#name-input").val().trim();
	var destination = $("#destination-input").val().trim();
	var firstTrainTime = $("#firstTrainTime-input").val().trim();
	var freq = $("#freq-input").val().trim();
	//check to make sure the user put in something
	if(name == "" || destination == "" || firstTrainTime == "" || freq == ""){
		if(name == ""){
			$("#name-input").addClass("warning");
		} 
		if(destination == ""){
			$("#destination-input").addClass("warning");
		}
		if(firstTrainTime == ""){
			$("#firstTrainTime-input").addClass("warning");
		}
		if(freq == ""){
			$("#freq-input").addClass("warning");
		}
		$("#modalHeader").text("Please make an entry in every field");
		return false;		
	}
	if ($(this).text().toLowerCase() != "update") {
		database.ref().push(
			{
				name: name,
				destination: destination,
				firstTrainTime: firstTrainTime,
				freq: freq
			});
		//clearout the input objects so that they are ready to use next time
		$("#name-input").val("");
		$("#destination-input").val("");
		$("#firstTrainTime-input").val("");
		$("#freq-input").val("");
	} else {
		//get the ID of the database record we are working on
		var ID = $(this).attr("data-id");
		//grab that record from the database
		var dbUpdate = database.ref(ID);
		//update the database
		dbUpdate.set(
			{
				name: name,
				destination: destination,
				firstTrainTime: firstTrainTime,
				freq: freq
			});
	}

	//update the array objects
	railYard.forEach(function(elem){
		if(elem.ID == ID){
			elem.name = name;
			elem.destination = destination;
			elem.firstTrainTime = firstTrainTime;
			elem.freq = freq;
		}
	});

	//update the modal
	getNext(firstTrainTime, freq);
	$("#name-" + ID).text(name);
	$("#dest-" + ID).text(destination);
	$("#freq-" + ID).text(freq);
	$("#next-" + ID).text(nextTime);
	$("#min-" + ID).text(nextMin);
	//hide the modal
	hideModal();
	//return false keeps form from reloading
	return false;
});

//if my inputs get focus remove warning
$("#name-input").focus(function(){
	$(this).removeClass("warning");
});
$("#destination-input").focus(function(){
	$(this).removeClass("warning");
});
$("#firstTrainTime-input").focus(function(){
	$(this).removeClass("warning");
});
$("#freq-input").focus(function(){
	$(this).removeClass("warning");
});

//function to clear warnings and close Modal
function hideModal(){
	//hide the modal
	$("#name-input").removeClass("warning");
	$("#destination-input").removeClass("warning");
	$("#firstTrainTime-input").removeClass("warning");
	$("#freq-input").removeClass("warning");
	modal.style.display = "none";	
}