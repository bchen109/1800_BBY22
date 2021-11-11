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
    if (user) {
      console.log(user.uid);
      var postID = date + user.uid;
      // Get a post image and store it in firebase storage
      let storageRef = firebase.storage().ref("posts").child(postID + ".jpg");
      console.log("Check Diff: " + storageRef);

      await storageRef.put(file);

      // Create the post document
      writePosts(html, user.uid, date, postID);

      // Get the URL of stored file
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

function writePosts(text, userValue, date, postID) {
  var postsRef = db.collection("posts").doc(postID);
  postsRef.set({
    date: date,
    user: userValue,
    description: text,
    image: "",
    likes: 0,
    comments: ""
  })
    .then(() => {
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