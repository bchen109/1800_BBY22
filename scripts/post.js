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

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: toolbarOptions
  },
});

function displayPicture() {
  const fileInput = document.getElementById("fileUploader");
  const image = document.getElementById("picture");

  // Attach listener to input file
  // When this file changes, do something
  fileInput.addEventListener('change', function (e) {

    // The change event returns a file "e.target.files[0]"
    let file = e.target.files[0];
    let blob = URL.createObjectURL(file);

    // Change the DOM img element source to point to this file
    image.src = blob;    //assign the "src" property of the "img" tag

    // Display the element
    document.getElementById("picture").style.display = "block";
  })
}
displayPicture();

// data
let = file = {};
document.getElementById('fileUploader').addEventListener('change', function (e) {
  file = e.target.files[0];
})

document.querySelector('#submit').addEventListener("click", function (e) {
  e.preventDefault();
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

      await storageRef.put(file);

      // Create the post document
      writePosts(html, user.uid, date, postID);

      // Get the URL of stored file and store it in the image field.
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

// This function is used to write to the firebase.
function writePosts(text, userValue, date, postID) {
  // Writing to the collection post and assigning document postID (timestamp + user.uid)
  // Setting the value of the posts.
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
      // If it is return to the home page.
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