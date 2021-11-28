/**
 * Function used to display the user name who is logged in. The user name information
 * is retreived from firebase userdata collection. Insert this information as part of the
 * welcome banner.
 */
function welcomeName() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if the user is signed in:
    if (user) {
      console.log("user: " + user.uid);
      currentUser = db.collection("userdata").doc(user.uid)
      currentUser.get()
        .then(userDoc => {
          var userName = userDoc.data().fullname;
          document.getElementById("welcomeName").innerHTML = userName;
        })
    } else {
      console.log("User not logged in");
      window.location.replace("login.html");
    }
  })
}
welcomeName();

var userName;
var userId = localStorage.getItem("userId");
if (userId) {
  db.collection("userdata").doc(userId)
    .get()
    .then(function (doc) {
      userName = doc.data()["fullname"];
    });
}

/**
 * We declared the array variables totalPosts and totalPostId as a var type global scope.
 *
 * We did this so it can be used in the displayPost function.
 *
 * The function grabPostInfo() retrieves firebase 'posts' collection information of the current user that is logged in as well as
 * connected user.
 *
 * This function is called in the displayPost function.
 */
var totalPosts = [];
var totalPostId = [];
async function grabPostInfo() {
  let connection;
  let userId = localStorage.getItem("userId");

  // Get function is asynchronous so we need to use async and await.
  // Grab all connected users associate with the logged in user from userdata collection.
  const connectRef = await db.collection("userdata")
    .doc(userId)
    .get().then(doc => {
      console.log(doc);
      connection = doc.data().connections;
      connection.push(userId);
      console.log("Check: " + connection, typeof connection);
    });

  // Grab all posts collection information from firebase for the current user and
  // all his/her list of connected users.
  // Please note the order as we are grabbing the most recent post(s).
  await db.collection("posts")
    .orderBy('date', 'desc')
    .get().then(function (queryDoc) {
      queryDoc.forEach((doc) => {
        // console.log(`${doc.id} => ${doc.data()}`);
        for (let i = 0; i < connection.length; i++) {
          if (doc.data().user == connection[i]) {
            totalPosts.push(doc.data());
            totalPostId.push(doc.id.replace(".", ""));
            console.log(`${doc.id} => ${doc.data()}`);
          }
        }
      })
    });
}

/**
 * Async function that needs to use await since .getDownloadURL() from firebase is an async function.
 *
 * This function is called in the displayPost function.
 *
 * @param url the string value of the partial location path of where the image is located in firebase storage.
 * @returns returns full URL link location of the user profile image from firebase storage.
 */
async function getUserProfileImg(url) {
  const imgUrl = await firebase.app().storage().ref("users").child(url).getDownloadURL();
  //console.log("url: " + imgUrl);
  return imgUrl;
}

/**
 * This function is the core part of how our post and comment functionality is implemented, created, and displayed.
 * 1. Retrieve information from the firebase datebase
 * 1a. Retrieval happens when we call the grabPostInfo()
 * 1b. In the displayPost() also retreiving info()
 * 2. Using the html templates of post and comment, injecting firebase collection data using queryselector.
 * 3. Add onclick events functionality for choosen elements.
 */
var newPost
async function displayPost() {
  // Retreive data from the firebase databse.
  await grabPostInfo();

  // For loop used to create number of post based on data return by firebase.
  for (let i = 0; i < totalPosts.length; i++) {
    // Use html post template.
    newPost = CardTemplate.content.cloneNode(true);

    // Retreive the username of user who created the post from the userdata collection.
    // Note: The post can be created by the current user or connected user.
    const userInfo = db.collection("userdata").doc(totalPosts[i].user)
    const doc = await userInfo.get();
    if (!doc.exists) {
      console.log('Document does not exist.');
    } else {
      const data = doc.data();
      let postId = totalPostId[i];

      // Retrieve the user profile image of the user who created the post.
      // Assign the data to an element and make it clickable.
      // If the user clicks on the user profile, redirect the user to the profile html page.
      const imgUrl = await getUserProfileImg(totalPosts[i].user + "/profile.jpg");
      newPost.querySelector('.profileImg').setAttribute("src", String(imgUrl));
      newPost.querySelector('.profileImg').setAttribute("alt", "Profile Pic");
      newPost.querySelector('.profileImg').onclick = function () {
        location.href = "viewprofile.html?userid=" + totalPosts[i].user;
      }

      // Assign the user name of the person who created the post.
      newPost.querySelector('.profileName').innerText = data.fullname;

      // The date data provides information of when the post is created.
      // date is from the post collection is a timestamp type.
      // Conversion to a javascript date with the defined format.
      // Assign the date value to the element.
      const date = new Date(totalPosts[i].date.seconds * 1000);
      const dateValue = date.toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "numeric"
      })
      newPost.querySelector('.timestamp').innerText = dateValue;

      // Assigning the main content of the post: Image and text.
      newPost.querySelector('.postImg').src = totalPosts[i].image;
      newPost.querySelector('.postImg').setAttribute("alt", "Post image");
      newPost.querySelector('.postText').innerHTML = totalPosts[i].description;

      // Creating the event where a person clicks on the link icon, it will update the value by one and write to firebase.
      newPost.querySelector('.likeIcon').onclick = async () => await incrementLikes(postId);

      // Assigning a unique id to distinguish each post. Append the template to the container that hold all posts.
      newPost.querySelector('.post-container').setAttribute("id", postId);
      document.getElementById("container").appendChild(newPost);

      // Listen if anoyone clicks on the like button and will update the display to show the new total likes.
      db.collection("posts").doc(postId)
        .onSnapshot((doc) => {
          document.getElementById(postId).querySelector(".likeCounter").innerText = doc.data().likes;
      })

      document.querySelector("#" + postId + " .add-comment").addEventListener("click", newComment.bind(null, postId));


      //document.querySelector("#" + postId + " .show-comments").addEventListener("click", loadComments.bind(null, postId));
      $toggle = $("#" + postId + " .show-comments");
      $toggle.click(function () {

        $comments = $("#" + postId + " .comments-go-here");
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $comments.slideToggle(500, function () {
          //execute this after slideToggle is done
          //change text of header based on visibility of content div
          if (document.querySelector("#" + postId + " .show-comments").innerHTML == "Show Comments") {
            document.querySelector("#" + postId + " .show-comments").innerHTML = "Hide Comments";
          } else {
            document.querySelector("#" + postId + " .show-comments").innerHTML = "Show Comments";
          }
        });

      });

      loadComments(postId);
    }
  }
}
displayPost();

/**
 * Function where a user clicks the like button it will increment the value by one and write to firebase.
 * We are writing to the posts collection and updating the field 'likes'.
 *
 * @param postID used to determine which like button belongs to which post.
 */
async function incrementLikes(postID) {
  console.log("PostID for like: " + postID);
  db.collection("posts").doc(postID).update({
      likes: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
      console.log("Document successfully updated!");
    })
    .catch((error) => {
      console.error("Error updating document: ", error);
    })
}

function loadComments(postId) {
  //CHANGE DOC HERE TO THE CURRENT POST ID!!!
  //console.log(postId);
  db.collection("posts").doc(postId)
    .get()
    .then(function (doc) {
      let comments = doc.data()["comments"];
      comments.forEach(function (item, index) {
        //console.log(item, index);
        populateComment(item, postId);
      });
    });

}

async function populateComment(commentId, postId) {
  let commentTemplate = document.querySelector("#comment-template");
  db.collection("comments").doc(commentId)
    .get()
    .then(async function (doc) {
      let description = doc.data()["description"];
      let fullName = doc.data().fullName;
      let currentUserId = doc.data().user;
      let profilePic = await getUserProfileImg(currentUserId + "/profile.jpg");
      //console.log(description);

      let newComment = commentTemplate.content.cloneNode(true);

      //update title and text and image
      // newComment.classList.add("deleteComment");
      newComment.querySelector('.user-name').innerHTML = fullName;
      newComment.querySelector('.description').innerHTML = description;
      newComment.querySelector('.commenter-img').setAttribute("src", profilePic);

      document.querySelector("#" + postId + " .comments-go-here").appendChild(newComment);

    });
}

async function newComment(postId) {
  let commentInput = document.querySelector("#" + postId + " .comment-input").value;
  if (!commentInput.trim()) {
    window.alert("Empty comment.")
    return 1;
  }
  //console.log(commentInput);
  db.collection("comments").add({
      user: userId,
      fullName: userName,
      description: commentInput
      //INSERTING IMAGE LOCATION HERE WOULD BE A GOOD IDEA
    })
    .then(function (docRef) {
      //console.log(docRef.id);
      db.collection('posts').doc(postId).update({
        comments: firebase.firestore.FieldValue.arrayUnion(docRef.id)
      });
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });

  document.querySelector("#" + postId + " .comment-input").value = "";

  let commentTemplate = document.querySelector("#comment-template");
  let newComment = commentTemplate.content.cloneNode(true);
  newComment.querySelector('.user-name').innerHTML = userName;
  newComment.querySelector('.description').innerHTML = commentInput;
  let profilePic = await getUserProfileImg(userId + "/profile.jpg");
  newComment.querySelector('.commenter-img').setAttribute("src", profilePic);

  document.querySelector("#" + postId + " .user-made-comments-go-here").prepend(newComment);

  //newComment.querySelector('.commenter-img').setAttribute("src", profilePic);
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