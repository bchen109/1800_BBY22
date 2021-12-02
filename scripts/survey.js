var userId = localStorage.getItem("userId");
console.log("Current User: " + userId);

/**
 * Checks if the form is valid before allows submission and changes to firestore.
 */
function checkValidityForm() {
    const forms = document.querySelectorAll('.needs-validation');
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach((form) => {
        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                console.log("Invalid!");
                event.preventDefault();
                event.stopPropagation();
            } else {
                updateUser();
                event.preventDefault();
                event.stopPropagation();
            }
        }, false);
    });
}

/**
 * Updates the user information to firebase.
 */
function updateUser() {
    if (userId) {
        db.collection("userdata").doc(userId)
            .update({ //write to firestore. We are using the UID for the ID in users collection
                // fullname: "hello world", //"users" collection
                // email: "hello world" //with authenticated user's ID (user.uid)
                age: Number(document.getElementById("age").value),
                hobbies: String(document.getElementById("hobbies").value),
                languages: String(document.getElementById("languages").value),
                nationality: String(document.getElementById("nationality").value),
                profilepicture: String("/uesrs/default/profile.jpg"),
                volunteer: Boolean(document.getElementById("volunteer").checked),
                quote: String(document.getElementById("quote").value),
                occupation: String(document.getElementById("occupation").value),
                fieldofstudy: String(getFieldOfStudy(document.getElementById("fieldofstudy").value)),
                connections: [],
                pending: [],
                notifications: [],
            }).then(function () {
                console.log("User data updated");
                window.location.assign("profile.html"); //re-direct to main.html after signup
            })
            .catch(function (error) {
                window.location.assign("login.html"); //re-direct to main.html after signup
                console.log("Error updating user data: " + error);
            });
    } else {
        console.log("Error no user parameter detected");
    }
}


/**
 * This function retrieves values in the url parameters.
 * @param {*} name parameter to retrieve
 * @returns value of the parameter specified
 */
function getParameter(name) {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var paramValue = url.searchParams.get(name);
    return paramValue;
}

/**
 * This function handles the button click to submit the survey.
 * @param {*} e event from the button
 */
function handleButtonClick(e) {
    if (e instanceof MouseEvent) {
        checkValidityForm();
        // updateUser();
    }
}

/**
 * This function returns the field of study with the corresponding value given.
 * @param {*} number to get field of study with
 * @returns field of study as a String
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
    return "ERROR";
}

// Initializes a FileReader object
var fileReader = new FileReader();
// File types to accept from the upload button
var filterType =
    /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

fileReader.onload = function (event) {
    var image = new Image();

    // Resizes the images the user uploads to 200x200
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
        // Uploads the user photo into firestore
        canvas.toBlob(function (blob) {
            firebase.app().storage().ref("users").child(userID + "/profile.jpg").put(blob).then(function () {
                console.log("File Uploaded!");
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
document.getElementById("submit-button").addEventListener("click", handleButtonClick, false);
// document.getElementById("fileUpload").addEventListener("change", loadImageFile(), false);
console.log("Loaded");
