// Initialize Firebase
var config = {
  apiKey: "AIzaSyBXq4T2nqdPs3VzJi2vDasipy9Lk6_nHq4",
  authDomain: "train-prediction-30fb7.firebaseapp.com",
  databaseURL: "https://train-prediction-30fb7.firebaseio.com",
  projectId: "train-prediction-30fb7",
  storageBucket: "",
  messagingSenderId: "122202982398"
};
firebase.initializeApp(config);

// Global variables
let database = firebase.database();

let trainName;
let destination;
let firstTrainTime;
let frequency;
let nextTrainArrival;
let nextTrainMinutesAway;

let trainNameEdit;
let destinationEdit;
let firstTrainTimeEdit;
let frequencyEdit;

let counter = 60;
let oldAttribute;

// Initial setup
$("#confirm-edit-btn").hide()
$("#cancel-edit-btn").hide()
// Current Time
let currentTimeGlobal = moment().format("MMM, DD, YYYY - HH:mm");
console.log('currentTimeGlobal', currentTimeGlobal)

// on-click event to retrieve input data
$("#submit-btn").on("click", function (event) {
  event.preventDefault();
  $(".validateMessage1").text(" ");
  $(".validateMessage2").text(" ");
  $(".validateMessage3").text(" ");
  $(".validateMessage4").text(" ");

  trainName = $("#train-input").val().trim();
  destination = $("#destination-input").val().trim();
  firstTrainTime = $("#time-input").val().trim();
  frequency = $("#frequency-input").val().trim();

  // Validate input data
  if (trainName === '') {
    console.log("train-input Blank")
    $(".validateMessage1").append("<p>").text("Field cannot be blank");
    return false;
  } else if (trainName.length < 5) {
    $(".validateMessage1").append("<p>").text("Field must be at least 5 characters");
    return false;
  }
  if (destination === '') {
    console.log("train-input Blank")
    $(".validateMessage2").text("Field cannot be blank");
    return false;
  } else if (destination.length < 4) {
    $(".validateMessage2").text("Field must be at least 4 characters")
    return false;
  }
  if (firstTrainTime === '') {
    $(".validateMessage3").text("Field cannot be blank")
    return false;
  }
  let validateTrainTime = firstTrainTime.split(":")
  console.log(validateTrainTime)
  if (validateTrainTime[0] > 24 || validateTrainTime[1] > 60 || firstTrainTime.length !== 5 || (validateTrainTime[0] === 24 && validateTrainTime[1] > 0)) {
    $(".validateMessage3").text("Invalid format")
    return false;
  }
  if (frequency === '') {
    $(".validateMessage4").text("Field cannot be blank")
    return false;
  } else if (frequency <= 0 || frequency > 60) {
    $(".validateMessage4").text("Field cannot be blank")
    return false;
  };

  // Save input values for storing to Firebase database
  let trainData = {
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
  }
  console.log('trainData', trainData)
  // Push input values to Firebase database
  database.ref().push(trainData)

  // Reset input fields to blanks
  trainData = {};
  $("#train-input").val(" ");
  $("#destination-input").val(" ");
  $("#time-input").val(" ");
  $("#frequency-input").val(" ");
});


const getNextTrainTime = (frequency, firstTrainTime) => {
  // Store "Next Arrival" and "Minutes Away" values in an array
  let trainArray = [];

  let tFrequency = frequency;

  // Push back firstTrainTime back 1 year to make sure it comes before current time
  let firstTrainTimeConverted = moment(firstTrainTime, "HH:mm").subtract(1, "year");

  // Current time
  let currentTime = moment();
  // console.log("currentTime: " + moment(currentTime).format("HH:mm"))

  // Difference between times
  let diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes")
  // console.log(`Difference in time: ${diffTime}`)

  // Time aparat (remainder - mod%) 
  let tRemainder = diffTime % tFrequency;
  // console.log(`timeRemainder ${tRemainder}`)

  // Minuets Away
  let tMinutesTillNextTrain = tFrequency - tRemainder;
  trainArray.push(tMinutesTillNextTrain)
  // nextTrainMinutesAway = tMinutesTillNextTrain;
  // console.log(`Minutes untill next train: ${tMinutesTillNextTrain}`)

  // Next Train
  let nextTrain = moment().add(tMinutesTillNextTrain, "minutes");
  nextTrainArrival = moment(nextTrain).format("hh:mm")
  trainArray.push(nextTrainArrival)
  // console.log(`Arrival Time: ${moment(nextTrain).format("hh:mm")}`)

  return trainArray;
}

// Firebase watcher - check when new train data is added
database.ref().on("child_added", function (childSnapshot) {
  // console.log(childSnapshot.val())
  frequency = childSnapshot.val().frequency;
  firstTrainTime = childSnapshot.val().firstTrainTime;
  // Invoke getNextTrainTime function for each train
  let trainStats = getNextTrainTime(frequency, firstTrainTime);
  // console.log('trainStat', trainStats)
  trainName = childSnapshot.val().trainName

  // Create Edit button
  let editButton = $("<button>")
  editButton.attr("data-train", trainName)
  editButton.addClass("edit-btn");
  editButton.text("✓");
  // Create Delete button
  let deleteButton = $("<button>")
  deleteButton.attr("data-train", trainName)
  deleteButton.addClass("delete-btn");
  deleteButton.text("X");


  // Populate HTML train table
  let newRow = $("<tr>")
  newRow.attr("data-train", trainName)
  $(newRow).append(
    $("<td>").text(trainName),
    $("<td>").text(childSnapshot.val().destination),
    $("<td>").text(childSnapshot.val().frequency),
    $("<td>").text(trainStats[1]),
    $("<td>").text(trainStats[0]),
  );
  $(newRow).append(editButton)
  $(newRow).append(deleteButton)
  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
});



setInterval(function () {
  counter--
  if (counter === 0) {
    counter = 60
  }
  $(".counter").html("<p>").append(`Seconds left until next train schedule update: ${counter}`)
}, 1000)

// Update train schedule table every minute
const trainInterval = setInterval(function () {
  $("#train-table > tbody").empty();
  database.ref().on("value", function (snapshot) {
    $("tbody").empty();
    snapshot.forEach((childSnapshot) => {
      // console.log('trainInterval', childSnapshot.val())

      // Populate HTML Train Schedule Table
      frequency = childSnapshot.val().frequency;
      firstTrainTime = childSnapshot.val().firstTrainTime;
      // Invoke getNextTrainTime function for each train
      let trainStats = getNextTrainTime(frequency, firstTrainTime);

      trainName = childSnapshot.val().trainName
      // Create Edit button
      let editButton = $("<button>")
      editButton.attr("data-train", trainName)
      editButton.addClass("edit-btn");
      editButton.text("✓");
      // Create Delete button
      let deleteButton = $("<button>")
      deleteButton.attr("data-train", trainName)
      deleteButton.addClass("delete-btn");
      deleteButton.text("X");

      // Populate HTML train table
      let newRow = $("<tr>")
      newRow.attr("data-train", trainName)
      $(newRow).append(
        $("<td>").text(trainName),
        $("<td>").text(childSnapshot.val().destination),
        $("<td>").text(childSnapshot.val().frequency),
        $("<td>").text(trainStats[1]),
        $("<td>").text(trainStats[0])
      );
      $(newRow).append(editButton)
      $(newRow).append(deleteButton)
      // Append the new row to the table
      $("#train-table > tbody").append(newRow);
    })
  })
}, 60000)

// on-click event to delete train
$(document).on("click", ".delete-btn", function (event) {
  event.preventDefault();
  // Get train data-attribute value
  let state = $(this).attr("data-train")
  console.log('state: ', state);
  // Remove train from HTML
  $(this).parent().remove();

  // Remove train from Firebase database function
  removeFirebaseData(state)
});

$(document).on("click", ".edit-btn", function (event) {
  // Hide submit button
  $("#submit-btn").hide()
  // Show edit buttons
  $("#confirm-edit-btn").show()
  event.preventDefault();
  console.log("click edit");
  let state = $(this).attr("data-train")
  console.log(state)
  let key;

  // Get train schedule info from Firebase
  database.ref().on("value", function (snapshot) {
    // Get Key Reference for trainName to remove
    console.log('edit click snapshot', snapshot.key)
    snapshot.forEach((childSnapshot) => {
      key = childSnapshot.key;
      let childData = childSnapshot.val();
      if (childData.trainName === state) {
        console.log(`key of train being edited: ${key}`)
        // train data from Firebase database
        console.log(childSnapshot.val().trainName)
        console.log(childSnapshot.val().destination)
        console.log(childSnapshot.val().firstTrainTime)
        console.log(childSnapshot.val().frequency)

        trainNameEdit = childSnapshot.val().trainName
        destinationEdit = childSnapshot.val().destination
        firstTrainTimeEdit = childSnapshot.val().firstTrainTime
        frequencyEdit = childSnapshot.val().frequency

        // Popluate train form for editing
        $("#train-input").val(trainNameEdit)
        $("#destination-input").val(destinationEdit)
        $("#time-input").val(firstTrainTimeEdit)
        $("#frequency-input").val(frequencyEdit)

        // Invoke confirmEditBtn function
        console.log('####confirm edit button', key, state)
        confirmEditBtn(key)
        oldAttribute = state

      }
    });
  });

});

// on-click event Confirm Edit Button function
const confirmEditBtn = (key) => {
  $("#confirm-edit-btn").show();
  $("#confirm-edit-btn").on("click", function (event) {
    event.preventDefault()

    console.log('confirm edit update key', key)
    console.log('oldAttribute', oldAttribute)

    // remove orginal edited row form HTML
    // let test = $('[data-train="oldAttribute"]')
    $('td[data-train="oldAttribute"]').remove()
    // console.log('test', test)

    // Get edited values
    trainNameEdit = $("#train-input").val().trim();
    destinationEdit = $("#destination-input").val().trim();
    firstTrainTimeEdit = $("#time-input").val().trim();
    frequencyEdit = $("#frequency-input").val().trim();

    console.log(
      trainNameEdit,
      destinationEdit,
      firstTrainTimeEdit,
      frequencyEdit
    )

    database.ref(`${key}`).update({
      trainName: trainNameEdit,
      destination: destinationEdit,
      firstTrainTime: firstTrainTimeEdit,
      frequency: frequencyEdit
    })
    // Hide submit button
    $("#confirm-edit-btn").hide()
    // Show edit buttons
    $("#submit-btn").show()

    // Reset input fields to blanks
    trainData = {};
    $("#train-input").val(" ");
    $("#destination-input").val(" ");
    $("#time-input").val(" ");
    $("#frequency-input").val(" ");
  })
  database.ref().on("child_changed", function (snapshot) {
    console.log(snapshot.val())
  })
};

// Remove train data from Firebase Database 
const removeFirebaseData = (state) => {
  database.ref().on("value", function (snapshot) {
    // Get Key Reference for trainName to remove
    snapshot.forEach((childSnapshot) => {
      let key = childSnapshot.key;
      let childData = childSnapshot.val();
      if (childData.trainName === state) {
        console.log(`key of train being deleted: ${key}`)
        // Firbase remove method - delete train from Firebase database
        database.ref(`${key}`).remove()
      }
    });
  });
};

// Update on child_changed 
database.ref().on("child_changed", function (childSnapshot) {
  console.log(childSnapshot.val())

  console.log(childSnapshot.val().trainName)
  console.log(childSnapshot.val().destination)
  console.log(childSnapshot.val().frequency)
  console.log(childSnapshot.val().firstTrainTime)



  frequency = childSnapshot.val().frequency;
  firstTrainTime = childSnapshot.val().firstTrainTime;
  // Invoke getNextTrainTime function for each train
  let trainStats = getNextTrainTime(frequency, firstTrainTime);
  // console.log('trainStat', trainStats)
  trainName = childSnapshot.val().trainName

  // Create Edit button
  let editButton = $("<button>")
  editButton.attr("data-train", trainName)
  editButton.addClass("edit-btn");
  editButton.text("✓");
  // Create Delete button
  let deleteButton = $("<button>")
  deleteButton.attr("data-train", trainName)
  deleteButton.addClass("delete-btn");
  deleteButton.text("X");


  // Populate HTML train table
  let newRow = $("<tr>")
  newRow.attr("data-train", trainName)
  $(newRow).append(
    $("<td>").text(trainName),
    $("<td>").text(childSnapshot.val().destination),
    $("<td>").text(childSnapshot.val().frequency),
    $("<td>").text(trainStats[1]),
    $("<td>").text(trainStats[0]),
  );
  $(newRow).append(editButton)
  $(newRow).append(deleteButton)
  // Append the new row to the table
  $("#train-table > tbody").append(newRow);

});


