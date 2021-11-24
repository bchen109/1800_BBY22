// Welcome banner.
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

var totalPosts = [];
var totalPostId = [];
async function grabPostInfo() {
  let connection;
  let userId = localStorage.getItem("userId");

  const connectRef = await db.collection("userdata")
    .doc(userId)
    .get().then(doc => {
      console.log(doc);
      connection = doc.data().connections;
      connection.push(userId);
      console.log("Check: " + connection, typeof connection);
    });
  // Grab all posts for each of the users
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
  // console.log(totalPostId[1]);
  // console.log(totalPosts[1].user);
}

async function getUserProfileImg(url) {
  const imgUrl = await firebase.app().storage().ref("users").child(url).getDownloadURL();
  //console.log("url: " + imgUrl);
  return imgUrl;
}

var newPost
async function displayPost() {
  await grabPostInfo();

  for (let i = 0; i < totalPosts.length; i++) {
    newPost = CardTemplate.content.cloneNode(true);
    const userInfo = db.collection("userdata").doc(totalPosts[i].user)
    const doc = await userInfo.get();
    if (!doc.exists) {
      console.log('Document does not exist.');
    } else {
      const data = doc.data();
      let postId = totalPostId[i];
      const imgUrl = await getUserProfileImg(totalPosts[i].user + "/profile.jpg");
      newPost.querySelector('.profileImg').setAttribute("src", String(imgUrl));
      newPost.querySelector('.profileImg').setAttribute("alt", "Profile Pic");
      newPost.querySelector('.profileName').innerText = data.fullname;
      const date = new Date(totalPosts[i].date.seconds * 1000);
      const dateValue = date.toDateString() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
      newPost.querySelector('.timestamp').innerText = dateValue;
      newPost.querySelector('.postImg').src = totalPosts[i].image;
      newPost.querySelector('.postImg').setAttribute("alt", "Post image");
      newPost.querySelector('.postText').innerHTML = totalPosts[i].description;
      newPost.querySelector('.likeIcon').onclick = async () => await incrementLikes(postId, newPost);


      // db.collection("posts").doc(postId)
      //   .onSnapshot((doc) => {
      //     //console.log("Checking onsnapshot: " + `${doc.id} => ${doc.data()}`);
      //     console.log(postId);
      //     console.log("Checking onsnapshot data: " + doc.data());
      //     //newPost.querySelector(".likeCounter").innterText = doc.data().likes;
      // })

      // newPost.querySelector('.likeCounter').innerText = totalPosts[i].likes;
      newPost.querySelector('.post-container').setAttribute("id", postId);
      document.getElementById("container").appendChild(newPost);

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

async function incrementLikes(postID, postTemplate) {
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

async function getUserProfileImg(url) {
  const imgUrl = await firebase.app().storage().ref("users").child(url).getDownloadURL();
  //console.log("url: " + imgUrl);
  return imgUrl;
}

async function updateLikeCounter(postID) {
  const docRef = await db.collection("posts").doc(postID).get();
  let value = docRef.data().likes;
  console.log("Likes data: " + value);
  return value;
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