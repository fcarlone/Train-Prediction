console.log('app.js')



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
let trainTime;
let frequency;

// on-click event to retrieve input data
$(".btn").on("click", function (event) {
  event.preventDefault();
  console.log('button clicked')
  trainName = $("#train-input").val().trim();
  destination = $("#destination-input").val().trim();
  trainTime = $("#time-input").val().trim();
  frequency = $("#frequency-input").val().trim();

  console.log('form-values', trainName, destination, trainTime, frequency);

  // Save input values for storing to Firebase database
  let trainData = {
    trainName: trainName,
    destination: destination,
    trainTime: trainTime,
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


// Firebase watcher
database.ref().on("child_added", function (childSnapshot) {
  console.log(childSnapshot.val())

})
