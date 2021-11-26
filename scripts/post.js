/**
 * Function that checks if a user is logged in. If no user is logged in, redirect to the login page.
 */
function redirectIfNotLoggedIn() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if the user is signed in:
    if (!user) {
      console.log("User not logged in");
      window.location.replace("login.html");
    }
  })
}
redirectIfNotLoggedIn();

/**
 * This function deals with customizing the quill editor to remove certain functionality and added some functionality.
 * The font is a combination of css and javascript in order for it to work. Customize the quill toobar to show only
 * the functionality that we want.
 */
let Font = Quill.import('formats/font');
Font.whitelist = ['calibri', 'arial', 'times-new-roman', 'verdana'];
Quill.register(Font, true);

var toolbarOptions = [
  [{ 'size': [] }],
  [{ 'font': ['calibri', 'arial', 'times-new-roman', 'verdana'] }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  ['link'],
  [{ 'align': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }]
]

/**
 * Callback function to create the quill editor with the customized toolbarOptions.
 */
var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: toolbarOptions
  },
});

/**
 * This function deals with the user inserting a post image and displaying it on the html page.
 * We declare a global variable file that will be referenced when we submit the post.
 */
var file = {}
function displayPicture() {
  // Get the file input element from post.html
  const fileInput = document.getElementById("fileUploader");
  // Get the image element from post.html
  const image = document.getElementById("picture");

  // Attach listener to file input element
  fileInput.addEventListener('change', function (e) {

    // The change event returns a file.
    file = e.target.files[0];
    let blob = URL.createObjectURL(file);

    // Change the DOM image element source to point to this file
    image.src = blob;

    // In the post.css we have this element display none. Once the user submits the picture, display it on
    // the html page.
    document.getElementById("picture").style.display = "block";
  })
}
displayPicture();

/**
 * The submit button when pressed will write all post information to firebase.
 */
document.querySelector('#submit').addEventListener("click", function (e) {
  e.preventDefault();
  // Get the timestamp which is used to display when the post occurred.
  var myEditor = document.querySelector('#editor');
  var html = myEditor.children[0].innerHTML;
  var date = firebase.firestore.Timestamp.now();
  console.log(html);

  firebase.auth().onAuthStateChanged(async user => {
    // Check if the user is logged in.
    if (user) {
      console.log(user.uid);
      var postID = date + user.uid;
      postID = "a" + postID.replace(".", "");
      // Get a post image and store it in firebase storage.
      let storageRef = firebase.storage().ref("posts").child(postID + ".jpg");
      console.log("Check Diff: " + storageRef);

      // Asynchronous function, wait for it to finish.
      await storageRef.put(file);

      // Create the post document.
      writePosts(html, user.uid, date, postID);

      // Get the URL of stored file and store it in the image field in the post collection.
      await storageRef.getDownloadURL()
        .then(function (url) {
          console.log("URL:" + url);
          db.collection("posts").doc(postID).update({
            "image": url
          })
            .then(function () {
              console.log('Added Post Picture URL to Firestore.');
            })
        })
    }
  })
})

/**
 * The writePosts function will create a document in the "posts" collection in firebase.
 * The function parameters will be used to insert data into the post fields.
 *
 * @param text value is used for the post text.
 * @param userValue value is the user who created the post.
 * @param date value is a timestamp of when the post is created.
 * @param postID  value is a unique identifier used to identify each post.
 */
function writePosts(text, userValue, date, postID) {
  // Writing to the collection post and assigning document postID (timestamp + user.uid)
  // Setting the values to the post fields.
  var postsRef = db.collection("posts").doc(postID);
  postsRef.set({
    postID: postID,
    date: date,
    user: userValue,
    description: text,
    image: "",
    likes: 0,
    comments: []
  })
    .then(() => {
      // Checking if writing to the firebase is complete.
      // If it is, return to the home page.
      postsRef.onSnapshot(snapshot => {
        if (snapshot.exists) {
          window.location.href = "./home.html";
        }
      })
    })
    .catch((error) => {
      console.error("Error writing document to posts collection: ", error)
    });
}

/**
 * Attach an event listener to the logout button which will call the logout function to log the user out
 * and redirect them back to the login.html page.
 */
document.getElementById("logout").addEventListener("click", logout);
function logout() {
  console.log("logging out user");
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    window.location.href = "login.html";
  }).catch((error) => {
    console.log(error)
  });
}