let Font = Quill.import('formats/font');
Font.whitelist = ['calibri', 'arial', 'times-new-roman', 'verdana'];
Quill.register(Font, true);

var toolbarOptions = [
  [{ 'size': []}],
  [{ 'font': ['calibri', 'arial', 'times-new-roman', 'verdana'] }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  ['link', 'image'],
  [{ 'align': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }]
]

var quill = new Quill('#editor', {
  modules: {
    toolbar: toolbarOptions
  },
  theme: 'snow'
});