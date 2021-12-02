/**
 * Thie function returns the field of study that corresponds with the number given.
 * @param {*} number value to use to find the corresponding field of study
 * @return the field of study the user has entered
 */
function getFieldOfStudy(number) {
    if (number == 1) {
        return "Applied & Natural Sciences";
    } else if (number == 2) {
        return "Business & Media";
    } else if (number == 3) {
        return "Computing & Information Technology";
    } else if (number == 4) {
        return "Engineering";
    } else if (number == 5) {
        return "Health Sciences";
    } else if (number == 6) {
        return "Trades";
    }
    return "ERROR SWITCH";
}
/**
 * If the user is not logged in then redirect them to the login page.
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
 * Handles the cancel button on the page.
 */
function cancelButton() {
    window.location.assign('profile.html');
}

/**
 * Updates the user information with the new information the user has entered
 * 
 * @param {*} event from the button
 */
function updateUser(event) {
    event.preventDefault();
    let x = (document.getElementById("nameInput").value == "") ? "default" : "newvalue";
    // console.log(document.getElementById("nameInput").value);
    // console.log(document.getElementById("nameInput").value == "");
    // console.log(document.getElementById("nameInput").placeholder);
    let nameInput = (document.getElementById("nameInput").value == "") ? document.getElementById("nameInput")
        .placeholder : document.getElementById("nameInput").value;
    let ageInput = (document.getElementById("ageInput").value == "") ? document.getElementById("ageInput")
        .placeholder : document.getElementById("ageInput").value;
    let hobbiesInput = (document.getElementById("hobbiesInput").value == "") ? document.getElementById("hobbiesInput")
        .placeholder : document.getElementById("hobbiesInput").value;
    let languagesInput = (document.getElementById("languagesInput").value == "") ? document.getElementById(
        "languagesInput").placeholder : document.getElementById("languagesInput").value;
    let occupationInput = (document.getElementById("occupationInput").value == "") ? document.getElementById(
        "occupationInput").placeholder : document.getElementById("occupationInput").value;
    let nationalityInput = (document.getElementById("nationalityInput").value == "") ? document.getElementById(
        "nationalityInput").placeholder : document.getElementById("nationalityInput").value;
    let quoteInput = (document.getElementById("quoteInput").value == "") ? document.getElementById("quoteInput")
        .placeholder : document.getElementById("quoteInput").value;
    let bioInput = (document.getElementById("bioInput").value == "") ? document.getElementById("bioInput")
        .placeholder : document.getElementById("bioInput").value;

    let fieldofstudyInput = (document.getElementById("fieldofstudy").value == "0") ? document.getElementById(
        "fieldofstudyInput").innerText : String(getFieldOfStudy(document.getElementById("fieldofstudy").value));

    let userId = localStorage.getItem("userId");
    if (userId) {
        db.collection("userdata").doc(userId)
            .update({ //write to firestore. We are using the UID for the ID in users collection
                fullname: nameInput, //"users" collection
                age: ageInput,
                hobbies: hobbiesInput,
                languages: languagesInput,
                nationality: nationalityInput,
                quote: quoteInput,
                occupation: occupationInput,
                fieldofstudy: fieldofstudyInput,
                bio: bioInput
            }).then(function () {
                console.log("User data updated");
                window.location.assign("profile.html"); //re-direct to main.html after signup
            })
    } else {
        console.log("Error no user parameter detected");
    }
}

/**
 * This function inserts data onto the page depending on if a user is logged in
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
 * This function retrieves the user document from firebase and populates onto the DOM.
 * @param {*} userId to retrieve the user document from
 */
async function getUserDoc(userId) {
    const cityRef = db.collection('userdata').doc(userId);
    const doc = await cityRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        const data = doc.data();
        document.getElementById("nameInput").placeholder = data.fullname;
        document.getElementById("quoteInput").placeholder = data.quote;
        document.getElementById("ageInput").placeholder = data.age;
        document.getElementById("bioInput").placeholder = data.bio;
        document.getElementById("occupationInput").placeholder = data.occupation;
        document.getElementById("fieldofstudyInput").innerText = data.fieldofstudy;
        document.getElementById("nationalityInput").placeholder = data.nationality;
        document.getElementById("languagesInput").placeholder = data.languages;
        document.getElementById("hobbiesInput").placeholder = data.hobbies;
        firebase.app().storage().ref("users").child(userId + "/profile.jpg").getDownloadURL().then(imgUrl => {
            document.getElementById("profilePicture").src = imgUrl;
            document.getElementById("personalInfoFields").disabled = false
        });
    }
}

// Initializes a file reader object
var fileReader = new FileReader();
// File types to accept
var filterType =
    /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

// Resizes the image to 200x200 when a user uploads a new photo for their profile picture
fileReader.onload = function (event) {
    var image = new Image();

    image.onload = function () {
        // document.getElementById("original-Img").src = image.src;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        // canvas.width = image.width / 4;
        // canvas.height = image.height / 4;
        canvas.width = 200;
        canvas.height = 200;
        context.drawImage(image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            canvas.width,
            canvas.height
        );
        let userID = localStorage.getItem('userId');
        // Upload the photo to firestore
        canvas.toBlob(function (blob) {
            firebase.app().storage().ref("users").child(userID + "/profile.jpg").put(blob).then(function () {
                console.log("File Uploaded!");
                firebase.app().storage().ref("users").child(userID + "/profile.jpg").getDownloadURL().then(
                    imgUrl => {
                        document.getElementById("profilePicture").src = imgUrl;
                        document.getElementById("personalInfoFields").disabled = false
                    }).catch(function (error) {
                    console.log("No profile picture found so using default picture");
                });
            })
        })

    }
    image.src = event.target.result;
};
var loadImageFile = function () {
    var uploadImage = document.getElementById("fileUpload");

    //check and retuns the length of uploded file.
    if (uploadImage.files.length === 0) {
        return;
    }

    //Is Used for validate a valid file.
    var uploadFile = document.getElementById("fileUpload").files[0];
    if (!filterType.test(uploadFile.type)) {
        alert("Please select a valid image.");
        return;
    }
    fileReader.readAsDataURL(uploadFile);
}

function test() {
    console.log("CLICKED");
}
insertData();
document.getElementById("cancel").addEventListener('click', cancelButton, false);
document.getElementById("submit").addEventListener('click', updateUser, false);
// document.getElementById("submit").addEventListener('click', test, false);

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