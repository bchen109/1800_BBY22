/**
 * Checks if the user is logged in, if not they are redirected to the login.html page
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
 * Create a bootstrap card that will display noficiation information to the user
 */
function createCard(type, imageLink, time, description, user, notificationId) {
    let buttonLeft, buttonRight, processFunction, notificationType, dismissFunction;
    if (type == "connection") {
        buttonLeft = "Accept";
        buttonRight = "Decline";
        processFunction = "acceptConnection('" + user + "', '" + notificationId + "');";
        dismissFunction = "declineConnection('" + user + "', '" + notificationId + "');";
    } else if (type == "connection-accept") {
        buttonLeft = "View";
        buttonRight = "Dismiss";
        processFunction = "viewNotification(" + "'connect.html'" + ", '" + notificationId + "');";
        dismissFunction = "dismissNotification('" + notificationId + "');";

    } else {
        buttonLeft = "View";
        buttonRight = "Dismiss";
        notificationType = "notification";
        processFunction = "viewNotification();";
        dismissFunction = "dismissNotification();";
    }
    // Create the card container
    let cardBody = document.createElement("div");
    cardBody.setAttribute("id", String(notificationId));
    cardBody.className = "card text-center mb-2";
    // Create the card header
    let cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.innerText = time;
    cardBody.appendChild(cardHeader);
    // Create card content container
    let cardContent = document.createElement("div");
    cardContent.className = "card-body d-flex justify-content-evenly vertical-center";

    // Create image link
    let profileLink = document.createElement("a");
    profileLink.setAttribute("href", "viewprofile.html?userid=" + user);
    // Create image child
    let image = document.createElement("img");
    image.src = imageLink;
    // Create text child
    let content = document.createElement("p");
    content.className = "card-text";
    content.innerText = description;
    // Create button container
    let buttonContainer = document.createElement("div");
    buttonContainer.className = "d-flex justify-content-evenly mb-2";
    // Create Dimiss button
    let buttonDismiss = document.createElement("button");
    buttonDismiss.className = "btn btn-secondary btn-sm";
    buttonDismiss.innerText = buttonRight;
    buttonDismiss.setAttribute("onclick", dismissFunction);
    buttonDismiss.nodeType = "button";
    // Create Accept button
    let buttonAccept = document.createElement("button");
    buttonAccept.className = "btn btn-success btn-sm"
    buttonAccept.innerText = buttonLeft;
    buttonAccept.setAttribute("onclick", processFunction);
    buttonAccept.nodeType = "button";
    // Add content to content container
    profileLink.appendChild(image);
    cardContent.appendChild(profileLink);
    cardContent.appendChild(content);
    // Add buttons to button container
    buttonContainer.appendChild(buttonAccept);
    buttonContainer.appendChild(buttonDismiss);
    // Add to main contianer
    cardBody.appendChild(cardContent);
    cardBody.appendChild(buttonContainer);

    const element = document.getElementById("container");
    element.appendChild(cardBody);
}
// createCard();

/**
 * Retrieves the current date.
 */
function getDate() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes();
    let dateTime = date + ' ' + time;
    return dateTime;
}

/**
 * Function that handles the "Accept" button when the user decides to accept a connection request.
 */
async function acceptConnection(user, notificationId) {
    let currentUser = localStorage.getItem("userId");
    let doc = await db.collection("userdata").doc(currentUser).get();
    let currentFullName = doc.data().fullname;

    // Add new connection to current user
    db.collection("userdata").doc(currentUser).update({
        connections: firebase.firestore.FieldValue.arrayUnion(user),
        notifications: firebase.firestore.FieldValue.arrayRemove(notificationId)
    }).then(function () {
        console.log("New connection added " + user);
    });

    // Add new connection to the opposing user
    db.collection("userdata").doc(user).update({
        connections: firebase.firestore.FieldValue.arrayUnion(currentUser),
        pending: firebase.firestore.FieldValue.arrayRemove(currentUser)
    }).then(function () {
        console.log("Connection accepted by " + currentUser);
    });

    // Add new notification to opposing user
    let userName = await db.collection("userdata").doc(user).get();
    userName = userName.data();
    db.collection("notifications").add({
        date: String(getDate()),
        description: String("Connection accepted by " + currentFullName),
        type: String("connection-accept"),
        title: String("Connection Accepted!"),
        touser: String(user),
        fromuser: String(currentUser)
    }).then((docRef) => {
        db.collection("userdata").doc(user).update({
            notifications: firebase.firestore.FieldValue.arrayUnion(String(docRef.id))
        }).then(function () {
            console.log("Notification sent successfully to -> " + user);
        })
    });


    // Delete the notification document
    db.collection("notifications").doc(notificationId).delete().then(function () {
        console.log("Notification deleted " + notificationId);
        deleteCard(notificationId);
    });
}

/**
 * Function that handles the "Decline" button when the user wants to decline a volunteer request.
 */
function declineConnection(user, notificationId) {
    let currentUser = localStorage.getItem("userId");

    // Add new connection to current user
    db.collection("userdata").doc(currentUser).update({
        notifications: firebase.firestore.FieldValue.arrayRemove(notificationId)
    }).then(function () {
        console.log("New connection declined " + user);
    });

    // Add new connection to the opposing user
    db.collection("userdata").doc(user).update({
        pending: firebase.firestore.FieldValue.arrayRemove(currentUser)
    }).then(function () {
        console.log("Connection declined by " + currentUser);
    })

    // Delete the notification document
    db.collection("notifications").doc(notificationId).delete().then(function () {
        console.log("Notification deleted " + notificationId);
        deleteCard(notificationId);
    });
}

/**
 * Function that redirects the user to the correct page which shows more information about this notification
 */
function viewNotification(page, notificationId) {
    window.location.replace(page);
    // dismissNotification(notificationId);
}

/**
 * Function that handles the "Dismiss" button when the user wants to dismiss a notification
 */
function dismissNotification(notificationId) {
    let currentUser = localStorage.getItem("userId");
    db.collection("userdata").doc(currentUser).update({
        notifications: firebase.firestore.FieldValue.arrayRemove(notificationId)
    }).then(function () {
        console.log("Notification Dismissed");
    });
    db.collection("notifications").doc(notificationId).delete().then(function () {
        console.log("Notification deleted " + notificationId);
        deleteCard(notificationId);
    });
}

/**
 * Function that deletes the notification card from the DOM once it is no longer needed
 */
function deleteCard(notificaitonId) {
    document.getElementById(notificaitonId).remove();
}

/**
 * Function retreives all the notification the current user has and displayed it on the DOM.
 */
async function getNotifications() {
    let userId = localStorage.getItem("userId");
    let doc = await db.collection("userdata").doc(userId);
    doc.onSnapshot((userDoc) => {
        userDoc = userDoc.data();
        console.log("Notification Length: " + userDoc.notifications.length);
        if (userDoc.notifications.length == 0) {
            document.getElementById("no-notifications").innerText = "No new notifications.";
        } else {
            document.getElementById("no-notifications").innerText = "";
            userDoc.notifications.forEach((item) => {
                console.log("Notification ID: " + item);
                db.collection("notifications").doc(item).get().then((doc) => {
                    let notificationData = doc.data();
                    let time = notificationData.date;
                    let description = notificationData.description;
                    let type = notificationData.type;
                    let user = notificationData.fromuser;
                    let notificationId = item;
                    let imageLink;
                    firebase.app().storage().ref("users").child(user + "/profile.jpg").getDownloadURL().then(
                        imgUrl => {
                            console.log("Retrieved image" + imgUrl);
                            imageLink = imgUrl;
                            createCard(type, imageLink, time, description, user, notificationId);
                        });
                })
            });
        }
    })
}
getNotifications();

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