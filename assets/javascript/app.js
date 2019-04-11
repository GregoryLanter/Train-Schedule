// link to my database
var database = firebase.database();
var railYard = [];
var nextTime = "";
var nextMin = "";
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
		modal.style.display = "none";
	}
}

intervalId = setInterval(updateTimer, 60000);

function updateTimer() {
	$(".train").remove();
	railYard.forEach(function (elem) {
		updateTable(elem);
	});
}

$(document.body).on("click", ".remove", function () {
	var ID = $(this).attr("data-ID");
	var dbDelete = database.ref(ID);
	dbDelete.remove();
	$(".train").remove();
	railYard.forEach(function (elem) {
		if (elem.ID != ID) {
			updateTable(elem);
		} else {
			railYard.splice(railYard.indexOf(elem), 1);
		}
	});
});


$(document.body).on("click", ".update", function () {
	//update
	var ID = $(this).attr("data-ID");
	$("#addTrain").text("Update");
	$("#modalHeader").text("Update Train");
	railYard.forEach(function (elem) {
		if (elem.ID == ID) {
			$("#name-input").val(elem.name);
			$("#destination-input").val(elem.destination);
			$("#firstTrainTime-input").val(elem.firstTrainTime);
			$("#freq-input").val(elem.freq);
			$("#addTrain").attr("data-ID", ID);
			modal.style.display = "block";
		}
	});
});

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
}
//}
//timer that fires every minute
//update all trains in table
function updateTable(currentLoco) {
	var colorText = "";
	var ID = currentLoco.ID
	var htmlStr = '<td id="name-' + ID + '">' + currentLoco.name + '</td>';

	getNext(currentLoco.firstTrainTime, currentLoco.freq);
	if ((nextMin / parseInt(currentLoco.freq)) > .667) {
		colorText = "greenText"
	} else {
		if ((nextMin / parseInt(currentLoco.freq)) > .333) {
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
//when train arrives update arrival to arrived until next departure
//upon departure update next arrivaland departure
//if time is greater than two thirds of frequency



// on child added
database.ref().on("child_added", function (childSnapshot) {
	var train = childSnapshot.val();

	//calculate next arrival and minutes away
	var loco = {
		ID: "",
		name: "",
		destination: "",
		firstTrainTime: "",
		freq: "",
	}
	loco.ID = childSnapshot.key;
	loco.name = train.name;
	loco.destination = train.destination;
	loco.firstTrainTime = train.firstTrainTime;
	loco.freq = train.freq;
	railYard.push(loco);
	updateTable(loco);
});

// onclick addTrain
$("#addTrain").click(function (event) {
	
	var name = $("#name-input").val().trim();
	var destination = $("#destination-input").val().trim();
	var firstTrainTime = $("#firstTrainTime-input").val().trim();
	var freq = $("#freq-input").val().trim();

	if ($(this).text().toLowerCase() != "update") {
		/*		var name = $("#name-input").val().trim();
				var destination = $("#destination-input").val().trim();
				var firstTrainTime = $("#firstTrainTime-input").val().trim();
				var freq = $("#freq-input").val().trim();*/
		database.ref().push(
			{
				name: name,
				destination: destination,
				firstTrainTime: firstTrainTime,
				freq: freq
			});
		$("#name-input").val("");
		$("#destination-input").val("");
		$("#firstTrainTime-input").val("");
		$("#freq-input").val("");
	} else {
		debugger;
		var ID = $(this).attr("data-id");
		var dbUpdate = database.ref(ID);
		dbUpdate.set(
			{
				name: name,
				destination: destination,
				firstTrainTime: firstTrainTime,
				freq: freq
			});
	}

	railYard.forEach(function(elem){
		if(elem.ID == ID){
			elem.name = name;
			elem.destination = destination;
			elem.firstTrainTime = firstTrainTime;
			elem.freq = freq;
		}
	});

	getNext(firstTrainTime, freq);
	$("#name-" + ID).text(name);
	$("#dest-" + ID).text(destination);
	$("#freq-" + ID).text(freq);
	$("#next-" + ID).text(nextTime);
	$("#min-" + ID).text(nextMin);
	modal.style.display = "none";
	return false;
});
