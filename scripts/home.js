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
      }); // put .then // third .then to populate the variable // or populate at the .then level.
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

function getCommentInformation() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const postRef = db.collection("posts")
        .where('user', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(1)
        .get();
      postRef.then(userDoc => {
        userDoc.docs.forEach(doc => {
          let a = doc.data().comments;
          a.sort(function (a, b) {
            return b - a
          });
          console.log(a);

        });
      })
    }
  })
}

function postCard(profileImg, userName, postImg, postContent, likeNumber) {
  // Create card container.
  let cardContainer = document.createElement("div");
  cardContainer.classList = "card m-4";

  // Create card header.
  let headerContainer = document.createElement("div");
  headerContainer.classList = "row row-cols-auto";

  // Create profile image.
  let profileImage = document.createElement("img");
  profileImage.classList = "card-img-top"
  profileImage.setAttribute("src", String(profileImg));
  profileImage.setAttribute("alt", "Profile Pic");

  // Create profile name.
  let profileName = document.createElement("p");
  profileName.classList = "card-text";
  profileName.innerText = userName;

  // Create post image container.
  let imageDiv = document.createElement("div");
  imageDiv.classList = "text-center";

  // Create image object
  let postImage = document.createElement("img");
  postImage.classList = "card-img-top"
  postImage.setAttribute("src", String(postImg));
  postImage.setAttribute("alt", "Post Image")

  // Create post text container.
  let postDiv = document.createElement("div");
  postDiv.classList = "card-body";

  // Div
  let div = document.createElement("div");

  // Create post text.
  let postText = document.createElement("p");
  postText.classList = "card-text";
  postText.innerText = postContent

  // Div bottom menu
  let bottomMenu = document.createElement("div")
  bottomMenu.classList = "d-flex justify-content-between"

  // like container
  let likeDiv = Document.createElement("div");
  likeDiv.classList = "d-flex row row-cols-auto";

  // like image
  let likeImg = document.createElement("img");
  likeImg.setAttribute("src", "images/like-icon.png");
  likeImg.setAttribute("alt", "Like Icon");
  likeImg.setAttribute("width", "30px");
  likeImg.setAttribute("height", "30px");

  // like counter
  let likeCounter = document.createElement("p");
  likeCounter.innerText = likeNumber;

  // comment container
  let commentContainer = document.createElement("div");
  commentContainer.classList = "row row-cols-auto"

  // comment text
  let comments = document.createElement("p");
  comments.innerText = Comments;

  cardContainer.appendChild(headerContainer);
  headerContainer.appendChild(profileImage);
  headerContainer.appendChild(profileName);
  cardContainer.appendChild(imageDiv);
  imageDiv.appendChild(postImage);
  cardContainer.appendChild(postDiv);
  postDiv.appendChild(div);
  div.appendChild(postText);
  postDiv.appendChild(bottomMenu);
  bottomMenu.appendChild(likeDiv);
  likeDiv.appendChild(likeImg);
  likeDiv.appendChild(likeCounter);
  bottomMenu.appendChild(commentContainer);
  commentContainer.appendChild(comments);

  document.getElementById("postContainer").appendChild(cardContainer);
}

function getConnections() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("User value: " + user.uid)
      console.log("User" + user);
      const connectRef = db.collection("userdata")
        .doc(user.uid)
        .get().then(doc => {
          console.log(doc);
          let a = doc.data().connections;
          console.log("Check: " + a);
        });
    }
  })
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
            totalPostId.push(doc.id);
            console.log(`${doc.id} => ${doc.data()}`);
          }
        }
      })
  });
  console.log(totalPostId[1])
  console.log(totalPosts[1].user);
}

async function displayPost() {
    for (let i = 0; i < info.length; i++) {
      let newPost = CardTemplate.content.cloneNode(true);
      const userInfo = db.collection("userdata").doc(totalPosts[i].user)
      const doc = await userInfo.get();
        if (!doc.exists) {
          console.log('Document does not exist.');
        } else {
          const data = doc.data();
          newPost.querySelector('.card m-4').setAttribute("id", "postID" + totalPostId[i]);
          newPost.querySelector('.card-img-top').setAttribute("src", String(profileImg));
          newPost.querySelector('.card-img-top').setAttribute("alt", "Profile Pic");
          newPost.querySelector('car')
          newPost.querySelector("#postID", '.top')

        }
    }
  }

  profileName.classList = "card-text";
  profileName.innerText = userName;

  // connection.forEach(element => {
  //   console.log(element);
  //   const postRef = db.collection("posts")
  //     .where('user', '==', element)
  //     .orderBy('date', 'desc')
  //     .get();
  //   postRef.then(postDoc => {
  //     postDoc.docs.forEach(doc => {
  //       console.log(`${doc.id} => ${doc.data()}`);
  //       totalPosts.push(doc.data());
  //     })
  //   })
  //   console.log("Total Posts: " + totalPosts.length);
  // })
