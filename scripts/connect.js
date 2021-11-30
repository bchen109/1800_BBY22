/**
 * This function redirects the user to the login page if they are not signed in
 * 
 */
function redirectIfNotLoggedIn() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if the user is signed in:
        if (!user) {
            console.log("User not logged in");
            window.location.replace("login.html");
        }
    });
}
redirectIfNotLoggedIn();

/**
 * This function creates a boot strap card and adds it to the DOM to show a list of connections that this user is currently connected to
 * 
 * @param {String} userName to use to create the card
 * @param {String} userNationality the nationality of the user
 * @param {String} userLanguage languages the user speaks
 * @param {String} userStudy the field of study of the user
 * @param {String} userHobby hobbies of the user
 * @param {String} imageLink the linke to the image
 * @param {String} connectionId the id of the user
 */
function connectionCard(userName, userNationality, userLanguage, userStudy, userHobby, imageLink,
    connectionId) {
    // Create the Card container
    let cardContainer = document.createElement("div");
    cardContainer.classList = "card mb-2";

    // Create flex box
    let flexContainer = document.createElement("div");
    flexContainer.classList = "d-flex container card-spacing";

    // Create image container
    let imageDiv = document.createElement("div");
    imageDiv.classList = "vertical-align";


    // Create image object
    let image = document.createElement("img");
    image.setAttribute("src", String(imageLink));
    image.setAttribute("alt", "profile");
    image.classList = "volunteer-image card-img-top";

    // Create link to wrap around image
    let connectionLink = document.createElement("a");
    connectionLink.setAttribute("href", "viewprofile.html?userid=" + connectionId);

    // Create card body
    let cardBody = document.createElement("div");
    cardBody.classList = "card-body text-start";

    // Create card title
    let cardTitle = document.createElement("h5");
    cardTitle.innerText = userName;

    // Create card natinality/ language
    let cardNationality = document.createElement("div");
    cardNationality.innerText = userNationality + "/ " + userLanguage

    // Create card hobby
    let cardHobby = document.createElement("div");
    cardHobby.innerText = userHobby;

    // Create card fieldofstudy
    let cardStudy = document.createElement("p");
    cardStudy.classList = "card-text";
    cardStudy.innerText = userStudy;

    cardContainer.appendChild(flexContainer);
    flexContainer.appendChild(imageDiv);
    connectionLink.appendChild(image);
    imageDiv.appendChild(connectionLink);
    flexContainer.append(cardBody);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardNationality);
    cardBody.appendChild(cardHobby);
    cardBody.appendChild(cardStudy);

    document.getElementById("connection-container").appendChild(cardContainer);
}

/**
 * This function deletes all the randomly generated volunteer accounts in the database.
 * SHOULD ONLY BE RUN THROUGH CONSOLE!!!
 */
function deleteVolunteers() {
    var volunteers = db.collection('userdata');
    volunteers.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (String(doc.id).includes("volunteer")) {
                db.collection("userdata").doc(doc.id).delete().then(function () {
                    console.log("Document deleted!");
                }).catch((error) => {
                    console.error("Error", error);
                });
            }
        })
    })
}

/**
 * This function retreives a list of volunteers based on the current useres field of study and saves them
 * inside an array
 * @returns a list of volunteers
 */
async function getVolunteers() {
    let userId = localStorage.getItem("userId");
    let userDoc = db.collection('userdata').doc(userId);
    let doc = await userDoc.get();
    let volunteerId;
    var result = [];
    if (!doc.exists) {
        console.log('No such user document!');
    } else {
        let data = doc.data();
        let userConnections = data.connections;
        let volunteerData;
        let volunteerId;
        await db.collection('userdata').where("volunteer", "==", true).where("fieldofstudy",
            "==", data.fieldofstudy).get().then(function (queryVolunteers) {
            queryVolunteers.forEach((doc) => {
                if (doc.id != userId && !userConnections.includes(doc.id)) {
                    result.push(doc.data());
                    volunteerIds.push(doc.id);
                }
            })
        });
        return result;
    }
}

/**
 * This function loads the basic volunteer profile onto the page.
 * 
 * Precondition: getVolunteers() must be called before calling this function
 */
function onLoad() {
    currentIndex = currentIndex % maxIndex;
    let volunteerData = volunteers[currentIndex];
    let volunteerId = volunteerIds[currentIndex];
    document.getElementById("fullname").innerText = volunteerData.fullname;
    document.getElementById("occupation").innerText = volunteerData.occupation;
    document.getElementById("nationality-languages").innerText = volunteerData.nationality + "/ " +
        volunteerData.languages;
    document.getElementById("quote").innerText = "\"" + volunteerData.quote + "\"";
    document.getElementById("profilelink").setAttribute("href", "viewprofile.html?userid=" + volunteerId);

    console.log(volunteerId + "/profile.jpg");

    firebase.app().storage().ref("users").child(volunteerId + "/profile.jpg").getDownloadURL().then(imgUrl => {
        console.log(imgUrl);
        document.getElementById("volunteer-img").src = imgUrl;
    });
    currentIndex++;
}

/**
 * This function returns the current date in this format YYYY-MM-DD HH:MM
 * @returns Returns the current date
 */
function getDate() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes();
    let dateTime = date + ' ' + time;
    return dateTime;
}

/**
 * This function handles what happens when the user wants to connect with a volunteer.
 */
async function sendConnectRequest() {
    let currentVolunteerId = volunteerIds[currentIndex - 1];
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
 * This function is in charge of retreiving a list of connections with the current user and displaying it onto
 * the screen.
 */
async function loadConnections() {
    let userId = localStorage.getItem("userId");
    let userDoc = await db.collection("userdata").doc(userId).get();
    userDoc = userDoc.data();
    userDoc.connections.forEach((item) => {
        console.log("Connection User ID: " + item);
        db.collection("userdata").doc(item).get().then((doc) => {
            let connectionData = doc.data();
            let userName = connectionData.fullname;
            let userStudy = connectionData.fieldofstudy;
            let userLanguage = connectionData.languages;
            let userNationality = connectionData.nationality;
            let userHobby = connectionData.hobbies;
            let connectionId = doc.id;
            let imageLink;
            firebase.app().storage().ref("users").child(doc.id + "/profile.jpg")
                .getDownloadURL().then(imgUrl => {
                    console.log("Retrieved image" + imgUrl);
                    imageLink = imgUrl;
                    connectionCard(userName, userNationality, userLanguage, userStudy,
                        userHobby, imageLink, connectionId);
                });
        })
    });
}

// Current index for the list of volunteers
var currentIndex;

// The maximum size of array
var maxIndex;

// List of volunteers and their data
var volunteers;

// List of volunteer ids
var volunteerIds = [];

/**
 * Main function which drives the program and stiches all the fuctions together
 */
async function main() {
    volunteers = await getVolunteers();
    loadConnections();
    currentIndex = 0;
    maxIndex = volunteers.length - 1;
    console.log(volunteers);
    onLoad();
    document.getElementById("next-button").addEventListener('click', onLoad, false);
    document.getElementById("connect-button").addEventListener('click', sendConnectRequest, false);
}
main();

/**
 * Attach an event listener to the logout button which will call the logout function to log the user out
 * and redirect them back to the login.html page.
 */
document.getElementById("logout").addEventListener("click", logout);

/**
 * Logs the user out.
 */
function logout() {
    console.log("logging out user");
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = "login.html";
    }).catch((error) => {
        console.log(error)
    });
}