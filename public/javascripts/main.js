(function($) {
  $(function() {
    var socket = io.connect();
    var timer = 0;
    var content;

    Simditor.locale = 'en-US';
    toolbar = ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'];
    mobileToolbar = ["bold", "underline", "strikethrough", "color", "ul", "ol"];

    var editor = new Simditor({
        textarea: $('#txt-content'),
        placeholder: '这里输入文字...',
        toolbar: toolbar,
        pasteImage: true,
        defaultImage: 'assets/images/image.png',
        upload: location.search === '?upload' ? {
            url: '/upload'
        } : false
    });


    socket.emit('init');

    socket.on('updateContent', function (data) {
      console.log(data);
      content = data;
      editor.setValue(data);
      editor.focus();
    });

    editor.on('valuechanged',function (){
      if(timer > 1 && editor.getValue() !== content){
          socket.emit('contentChanged', editor.getValue());
      }
      timer++;
    });
  });

}(jQuery));
