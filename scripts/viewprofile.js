/**
 * This function retrieves the parameters from the url
 * @param {*} name of the parameter to retrieve
 * @returns  the value associated with the parameter name given
 */
function getParameter(name) {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var paramValue = url.searchParams.get(name);
    console.log(paramValue);
    return paramValue;
}

/**
 * This function retrieves the user document from firebase and populates it onto the DOM.
 */
async function getUserDoc(userId) {
    const cityRef = db.collection('userdata').doc(userId);
    const doc = await cityRef.get();
    let currentUser = localStorage.getItem("userId");
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        const data = doc.data();
        if (data.volunteer == true) {
            document.getElementById("fullname").innerText = data.fullname + " (Volunteer)";
        } else {
            document.getElementById("fullname").innerText = data.fullname;
        }

        if (data.connections.includes(currentUser)) {
            document.getElementById("contactinfo").innerHTML = data.email;
            document.getElementById("connectButton").remove();
        } else {
            document.getElementById("connectButton").addEventListener('click', sendConnectRequest, false);
            document.getElementById("contact-card").remove();
        }

        document.getElementById("quote").innerText = data.quote;
        document.getElementById("bio").innerText = data.bio;
        document.getElementById("occupation").innerText = data.occupation;
        document.getElementById("fieldofstudy").innerText = data.fieldofstudy;
        document.getElementById("nationality").innerText = data.nationality;
        document.getElementById("languages").innerText = data.languages;
        document.getElementById("hobbies").innerText = data.hobbies;
        firebase.app().storage().ref("users").child(userId + "/profile.jpg").getDownloadURL().then(
            imgUrl => {
                document.getElementById("profilePicture").src = imgUrl;
            }).catch(function (error) {
            console.log("No profile picture found so using default picture");
        });
    }
}

/**
 * This function retrieves the current date.
 */
function getDate() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes();
    let dateTime = date + ' ' + time;
    return dateTime;
}

/**
 * This function handles what happens when the user decides to send a connection request to another user.
 */
async function sendConnectRequest() {
    let currentVolunteerId = getParameter("userid");
    let userId = localStorage.getItem("userId");
    let duplicate = false;

    // Checking if the a pending connection already exists or if the connection has already been made
    let userDoc = await db.collection("userdata").doc(userId).get();
    let notificationMessage;
    userDoc = userDoc.data();
    userDoc.pending.forEach((item) => {
        if (String(item) == String(currentVolunteerId)) {
            duplicate = true;
            notificationMessage = "There is already a pending connection.";
        }
    })
    userDoc.connections.forEach((item) => {
        if (String(item) == String(currentVolunteerId)) {
            duplicate = true;
            notificationMessage = "You are already connected with this user.";
        }
    })
    if (!duplicate) {
        db.collection("notifications").add({
            date: String(getDate()),
            description: String("New connection request from " + userDoc.fullname),
            type: String("connection"),
            title: String("Connection Request!"),
            touser: String(currentVolunteerId),
            fromuser: String(userId)
        }).then((docRef) => {
            db.collection("userdata").doc(currentVolunteerId).update({
                notifications: firebase.firestore.FieldValue.arrayUnion(String(docRef.id))
            }).then(function () {
                console.log("Notification sent successfully to -> " + currentVolunteerId);
            });
            db.collection("userdata").doc(userId).update({
                pending: firebase.firestore.FieldValue.arrayUnion(String(
                    currentVolunteerId))
            }).then(function () {
                console.log("Pending connections added " + currentVolunteerId);
            });
        });
        document.getElementById("toast-notification").innerText = "Connection sent!";
        $('.toast').toast('show');
    } else {
        document.getElementById("toast-notification").innerText = notificationMessage;
        $('.toast').toast('show');
        console.log("Duplicate connection request");
    }
}

/**
 * This is the main function for the program and is then entry point.
 */
async function main() {
    await getUserDoc(getParameter("userid"));
}
main();

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