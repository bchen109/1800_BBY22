// TODO need to auto generate posts.
function createPost() {
  // Create the first div.
  var post = document.createElement("div");
  post.className = "post";

  // Create the second div inside the first div.
  var postHeader = document.createElement("div");
  postHeader.className = "postHeader";
  var postUser = document.createElement("p");
  postUser.className = "postUser"

  // Append the postUser inside the second div
  postHeader.appendChild(postUser);

  // Place the second div inside the first div.
  post.appendChild(postHeader);

  // Append the everything to the body.
  document.body.appendChild(post);
}


// Testing the function to retreive the latest post of a user.
// This is for testing as we can probably do x number post at a time.
// We are putting a condition where the user has to match the user.uid.
// TODO: In the future we are going to have connection of user to match the connection.;
function getPostUserInfo() {
  let userId;
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const postRef = db.collection("posts")
        .where('user', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(1)
        .get();
        postRef.then(userDoc => {
        userDoc.docs.forEach(doc => {
          console.log("Timestamp:" + doc.data().date);
          userId = doc.data().user;
          console.log("User id: " + userId);
        })
      }).then(async function () {
        console.log("getPostUserInfo return user:" + userId);
        const userInfo = db.collection("userdata").doc(userId);
        const doc = await userInfo.get();
        if (!doc.exists) {
          console.log('Document does not exist.');
        } else {
          const data = doc.data();
          document.getElementById("name").innerHTML = data.fullname;
          firebase.app().storage().ref("users").child(userId + "/profile.jpg").getDownloadURL().then(imgUrl => {
            document.getElementById("profileImage").src = imgUrl;
          }).catch(function (error) {
            console.log("No profile picture found so using default picture");
          });
        }
      });
    } else {
      console.log("User not logged in");
    }
  })
}
getPostUserInfo();

function getPostInformation() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const postRef = db.collection("posts")
      .where('user', '==', user.uid)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
      postRef.then(userDoc => {
        userDoc.docs.forEach(doc => {
          document.getElementById("postText").innerHTML = doc.data().description;
          document.getElementById("postPic").src = doc.data().image;
          document.getElementById("counter").innerHTML = doc.data().likes;
        })
      })
    }
  })
}
getPostInformation();

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

