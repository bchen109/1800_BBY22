// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            var user = authResult.user; // get the user object from the Firebase authentication database
            if (authResult.additionalUserInfo.isNewUser) { //if new user
                db.collection("userdata").doc(user.uid)
                    .set({ //write to firestore. We are using the UID for the ID in users collection
                        fullname: user.displayName, //"users" collection
                        email: user.email //with authenticated user's ID (user.uid)
                    }).then(function () {
                        console.log("New user added to firestore");
                        localStorage.setItem("userId", user.uid);
                        window.location.assign("survey.html?user=" + user.uid); //re-direct to main.html after signup
                    })
                    .catch(function (error) {
                        console.log("Error adding new user: " + error);
                    });
            } else {
                localStorage.setItem("userId", user.uid);
                return true;
            }
            return false;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: './home.html',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
};
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);