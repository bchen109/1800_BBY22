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
          newPost.querySelector('.post-container').setAttribute("id", totalPostId[i]);
          firebase.app().storage().ref("users").child(totalPosts[i].user + "/profile.jpg").getDownloadURL().then(imgUrl => {
            console.log(imgUrl);
            newPost.querySelector('.profileImg').setAttribute("src", String(imgUrl));
          });
          newPost.querySelector('.profileImg').setAttribute("alt", "Profile Pic");
          newPost.querySelector('.profileName').innerText = data.fullname;
          newPost.querySelector('.postImg').src = totalPosts[i].image;
          newPost.querySelector('.postImg').setAttribute("alt", "Post image");
          newPost.querySelector('.postText').innerHTML = totalPosts[i].description;
          newPost.querySelector('.likeCounter').innerText = totalPosts[i].likes;

          document.getElementById("postContainer").appendChild(newPost);
        }
    }
  }
  displayPost();
