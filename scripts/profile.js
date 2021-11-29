/**
 * Function redirects the user to the login.html page if they are not logged in.
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
 * If there is currently a logged in user then update the DOM with their
 * data.
 */
function insertData() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user) {
            // Do something for the current logged-in user here: 
            console.log("Current User: " + user.uid);
            getUserDoc(user.uid);
        } else {
            document.getElementById("name-goes-here").innerText = "Nobody";
        }
    });
}

/**
 * Retrieves the user document from firebase and populates it onto the DOM
 */
async function getUserDoc(userId) {
    const userRef = db.collection('userdata').doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        const data = doc.data();
        if (data.volunteer == true) {
            document.getElementById("fullname").innerText = data.fullname + " (Volunteer)";
        } else {
            document.getElementById("fullname").innerText = data.fullname;
        }
        document.getElementById("quote").innerText = data.quote;
        document.getElementById("bio").innerText = data.bio;
        document.getElementById("occupation").innerText = data.occupation;
        document.getElementById("fieldofstudy").innerText = data.fieldofstudy;
        document.getElementById("nationality").innerText = data.nationality;
        document.getElementById("languages").innerText = data.languages;
        document.getElementById("hobbies").innerText = data.hobbies;
        document.getElementById("contactinfo").innerHTML = data.email;
        firebase.app().storage().ref("users").child(userId + "/profile.jpg").getDownloadURL().then(imgUrl => {
            document.getElementById("profilePicture").src = imgUrl;
        }).catch(function (error) {
            console.log("No profile picture found so using default picture");
        });
    }
}

insertData();
// Redirects the "Edit Profile" button to the editprofile.html page
document.getElementById("edit-profile").addEventListener("click", function (e) {
    window.location.assign("editprofile.html");
}, false);

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