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
    }
  })
}
welcomeName();

var userName;
var userImg;
var userId = localStorage.getItem("userId");
if (userId) {
  db.collection("userdata").doc(userId)
    .get()
    .then(function (doc) {
      userName = doc.data()["fullname"];
      userImg = doc.data()["profilepicture"];
    });
} else {
  window.location.replace("login.html");
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
  console.log(totalPostId[1]);
  console.log(totalPosts[1].user);
}

async function displayPost() {
  await grabPostInfo();

  for (let i = 0; i < totalPosts.length; i++) {
    let newPost = CardTemplate.content.cloneNode(true);
    const userInfo = db.collection("userdata").doc(totalPosts[i].user)
    const doc = await userInfo.get();
    if (!doc.exists) {
      console.log('Document does not exist.');
    } else {
      const data = doc.data();
      let postId = "a" + totalPostId[i];
      console.log
      firebase.app().storage().ref("users").child(totalPosts[i].user + "/profile.jpg").getDownloadURL().then(imgUrl => {
        console.log("url: " + imgUrl + " PostId: " + totalPostId[i]);
        newPost.querySelector('.profileImg').setAttribute("src", String(imgUrl));
      });
      newPost.querySelector('.profileImg').setAttribute("alt", "Profile Pic");
      newPost.querySelector('.profileName').innerText = data.fullname;
      newPost.querySelector('.postImg').src = totalPosts[i].image;
      newPost.querySelector('.postImg').setAttribute("alt", "Post image");
      newPost.querySelector('.postText').innerHTML = totalPosts[i].description;
      newPost.querySelector('.likeCounter').innerText = totalPosts[i].likes;
      newPost.querySelector('.post-container').setAttribute("id", postId);
      document.getElementById("container").appendChild(newPost);

      document.querySelector("#" + postId + " .add-comment").addEventListener("click", newComment.bind(null, postId));
      document.querySelector("#" + postId + " .show-comments").addEventListener("click", loadComments.bind(null, postId));
    }
  }
}
displayPost();

function loadComments(postId) {
  //CHANGE DOC HERE TO THE CURRENT POST ID!!!
  let directory = postId.substring(1, 13) + "." + postId.substring(13, postId.length);
  console.log(directory, " and ", postId)
  db.collection("posts").doc(directory)
    .get()
    .then(function (doc) {
      let comments = doc.data()["comments"];
      comments.forEach(function (item, index) {
        console.log(item, index);
        populateComment(item, postId);
      });
    });
  //document.querySelector("#" + postId + " .show-comments").addEventListener("click", removeComments);
  document.querySelector("#" + postId + " .show-comments").removeEventListener("click", loadComments.bind(null, postId));

}

/*function removeComments(postId) {
    let elements = document.querySelector("#" + postId + " .deleteComment");
    console.log("elements: " + elements);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    
    document.querySelector("#" + postId + " .show-comments").addEventListener("click", loadComments.bind(null, postId));
    document.querySelector("#" + postId + " .show-comments").removeEventListener("click", removeComments);
}*/

function populateComment(commentId, postId) {
  let commentTemplate = document.querySelector("#comment-template");
  db.collection("comments").doc(commentId)
    .get()
    .then(function (doc) {
      let description = doc.data()["description"];
      let fullName = doc.data().fullName;
      console.log(description);

      let newComment = commentTemplate.content.cloneNode(true);

      //update title and text and image
      // newComment.classList.add("deleteComment");
      newComment.querySelector('.user-name').innerHTML = fullName;
      newComment.querySelector('.card-body').classList.add("deleteComment");
      newComment.querySelector('.description').innerHTML = description;
      document.querySelector("#" + postId + " .comments-go-here").appendChild(newComment);

    });
}

function newComment(postId) {
  let commentInput = document.querySelector("#" + postId + " .comment-input").value;
  console.log(commentInput);
  let directory = postId.substring(1, 13) + "." + postId.substring(13, postId.length);
  db.collection("comments").add({
      user: userId,
      fullName: userName,
      description: commentInput
      //INSERTING IMAGE LOCATION HERE WOULD BE A GOOD IDEA
    })
    .then(function (docRef) {
      console.log(docRef.id);
      db.collection('posts').doc(directory).update({
        comments: firebase.firestore.FieldValue.arrayUnion(docRef.id)
      });
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });

  document.querySelector("#" + postId + " .comment-input").value = "";
}