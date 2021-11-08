let Font = Quill.import('formats/font');
Font.whitelist = ['calibri', 'arial', 'times-new-roman', 'verdana'];
Quill.register(Font, true);

var toolbarOptions = [
  [{ 'size': []}],
  [{ 'font': ['calibri', 'arial', 'times-new-roman', 'verdana'] }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  ['link'],
  [{ 'align': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }]
]

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: toolbarOptions
  },
});

// data
let = file = {};
document.getElementById('fileUploader').addEventListener('change', function (e) {
  file = e.target.files[0];
})

document.querySelector('#submit').addEventListener("click", function(e) {
  e.preventDefault();
  var myEditor= document.querySelector('#editor');
  var html = myEditor.children[0].innerHTML;
  console.log(html);

  firebase.auth().onAuthStateChanged(user => {

    if (user) {
      console.log(user.uid);

      // Get A Profile Image from the Cloud Storage
      firebase
      .storage()
      .ref("users")
      .child(user.uid + "/post.jpg")
      .put(file);
    }
  })
})