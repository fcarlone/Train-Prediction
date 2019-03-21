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
  // Push input values to Firebase database
  database.ref().push(trainData)

  // Reset input fields to blanks
  $("#train-input").text(" ");
  $("#destination-input").text(" ");
  $("#time-input").text(" ");
  $("#frequency-input").text(" ");
});


const getNextTrainTime = (frequency, firstTrainTime) => {
  // Store "Next Arrival" and "Minutes Away" values in an array
  let trainData = [];

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
  trainData.push(tMinutesTillNextTrain)
  // nextTrainMinutesAway = tMinutesTillNextTrain;
  console.log(`Minutes untill next train: ${tMinutesTillNextTrain}`)

  // Next Train
  let nextTrain = moment().add(tMinutesTillNextTrain, "minutes");
  nextTrainArrival = moment(nextTrain).format("hh:mm")
  trainData.push(nextTrainArrival)
  console.log(`Arrival Time: ${moment(nextTrain).format("hh:mm")}`)

  return trainData;
}

// Firebase watcher - check when new train data is added
database.ref().on("child_added", function (childSnapshot) {
  console.log(childSnapshot.val())
  frequency = childSnapshot.val().frequency;
  firstTrainTime = childSnapshot.val().firstTrainTime;
  // Invoke getNextTrainTime function for each train
  let trainStat = getNextTrainTime(frequency, firstTrainTime);
  console.log('trainStat', trainStat)

  // Populate HTML train table
  let newRow = $("<tr>").append(
    $("<td>").text(childSnapshot.val().trainName),
    $("<td>").text(childSnapshot.val().destination),
    $("<td>").text(childSnapshot.val().frequency),
    $("<td>").text(trainStat[1]),
    $("<td>").text(trainStat[0]),

  );
  // Append the new row to the table
  $("#train-table > tbody").append(newRow);
})

// Update train schedule table every minute
const trainInterval = setInterval(function () {
  $("tbody").empty();
  database.ref().on("value", function (snapshot) {
    snapshot.forEach((childSnapshot) => {
      console.log('trainInterval', childSnapshot.val())


      // Populate HTML Train Schedule Table
      frequency = childSnapshot.val().frequency;
      firstTrainTime = childSnapshot.val().firstTrainTime;
      // Invoke getNextTrainTime function for each train
      let trainStat = getNextTrainTime(frequency, firstTrainTime);
      console.log('trainStat', trainStat)

      // Populate HTML train table
      let newRow = $("<tr>").append(
        $("<td>").text(childSnapshot.val().trainName),
        $("<td>").text(childSnapshot.val().destination),
        $("<td>").text(childSnapshot.val().frequency),
        $("<td>").text(trainStat[1]),
        $("<td>").text(trainStat[0]),

      );
      // Append the new row to the table
      $("#train-table > tbody").append(newRow);
    })
  })
}, 15000)


