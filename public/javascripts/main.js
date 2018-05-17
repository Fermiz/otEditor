(function($) {
  $(function() {
    var socket = io.connect();
    var timer = 0;

    var editor = new Simditor({
      textarea: $('#txt-content'),
      pasteImage: true,
      toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent'],
      defaultImage: '/images/image.png',
      upload: location.search === '?upload' ? {
        url: '/upload'
      } : false
    });

    socket.on('updateContent', function (data) {
      console.log(data);
      editor.setValue(data);
    });

    editor.on('valuechanged',function (){
      if(timer > 1){
          socket.emit('contentChanged', editor.getValue());
      }else{
          socket.emit('init');
      }
      timer++;
    });

    return editor;
  });

}(jQuery));
