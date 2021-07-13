function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    }
});

var sendimage;
var imageindex;

const indexFinder = (el) => {
    imageindex=parseInt($(el).attr("data-number"));
    $($("input[type='file']")[imageindex]).val('');
    tabIndicator=imageindex;
}

const onChangeInputHandler = (e) => {
    let file = e.target.files;
    let receiver=chats[imageindex][0];
    sendimage = file[0];
    if (file && file[0]) {
        var reader = new FileReader();
        reader.onload = function () {
            imageSubmitHandler(username,receiver,imageindex);
        }
        reader.readAsDataURL(file[0]);
    }
}

const imageSubmitHandler = function(sender,receiver,index) {
    let form_data = new FormData();
    form_data.append('data', sendimage);
    let isgroup=chats[index].length-1;
    isgroup = chats[index][isgroup];
    let path;
    if(isgroup==0)
        path="/chat/image/"+sender+"/"+receiver+"/";
    else path="/group/image/"+receiver+"/";
    $.ajax({
        url: path,
        type: 'POST',
        data: form_data,
        contentType: false,
        processData: false,
        cache : false,
        success: function (response) {
            if(isgroup==0){
                sockets[index].send(JSON.stringify({
                    'type':2,
                    'message':response['path'],
                }));
            }
            else{
                sockets[index].send(JSON.stringify({
                    'message' : response['path'],
                    'type' : 2,
                    'sender':sender,
                }));
            }
        },
        error: function(){
            console.log("Internal Server Error");
        },        
    });
};