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

// Current Time
let currentTimeGlobal = moment().format("MMM, DD, YYYY - HH:mm");
console.log('currentTimeGlobal', currentTimeGlobal)

// on-click event to retrieve input data
$(".btn").on("click", function (event) {
  event.preventDefault();

  trainName = $("#train-input").val().trim();
  destination = $("#destination-input").val().trim();
  firstTrainTime = $("#time-input").val().trim();
  frequency = $("#frequency-input").val().trim();

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
})

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
}, 15000)

// on-click event to delete train
$(document).on("click", ".delete-btn", function (event) {
  event.preventDefault();
  // Get train data-attribute value
  let state = $(this).attr("data-train")
  console.log('state: ', state);
  // Remove train from HTML
  $(this).parent().remove();

  // Remove train from Firebase database
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
});

$(document).on("click", ".edit-btn", function (event) {
  event.preventDefault();
  console.log("click edit");
  let state = $(this).attr("data-train")
  console.log(state)
})

