const incallmsgcreator = (fullname,time,msg) => {
    return '<div class="incallmsgs">'+
                '<div class="sender-data">'+
                    '<div class="incallsender">'+fullname+'</div><div class="incallsendertime">'+time+'</div>'+
                '</div>'+
                '<div class="incallmsgsent"><p>'+msg+'</p></div>'+
            '</div>';
}

const micClickListener = (el) => {
    $(el).tooltip("hide");
    const icon=$(el).children()[0];
    const text=$(icon).html();
    if(text==='mic'){
        $(el).attr("data-original-title","Mic On");
        $(el).css("background","#d93025");
        $(icon).html("mic_off");
    }
    else{
        $(el).attr("data-original-title","Mic Off");
        $(el).css("background","#3c4043");
        $(icon).html("mic");
    }
}
const videocamClickListener = (el) => {
    $(el).tooltip("hide");
    const icon=$(el).children()[0];
    const text=$(icon).html();
    if(text==='videocam'){
        $(el).css("background","#d93025");
        $(icon).html("videocam_off");
        $(el).attr("data-original-title","Video On");
    }
    else{
        $(el).css("background","#3c4043");
        $(icon).html("videocam");
        $(el).attr("data-original-title","Video Off");
    }
}
const bottomButtonsListener = (el,active,inactive) => {
    $(el).tooltip("hide");
    const icon=$(el).children()[0];
    const text=$(icon);
    if($(text).css("color")==="rgb(255, 255, 255)"){
        $(text).css("color","#000");
        $(el).css("background","#8ab4f9")
        $(el).attr("data-original-title",active);
    }
    else{
        $(text).css("color","#fff");
        $(el).css("background","#3c4043")
        $(el).attr("data-original-title",inactive);
        if(active=="Stop Presenting") {
            sendSignalShare('share-screen-close',{},1);
            stopSharingHandler("share"+username);
            return;
        }
        $("#call1").css("width","100%");
        $(".hidden-window").css("display","none");
        return;
    }
    if(active=="Stop Presenting"){
        shareScreen();
    }
    if(active=="Hide Chats"){
        commonWork();
    }
}

const inCallHandlerIcon = (el) => {
    let val=$(el).val();
    if(val!=''){
        $(".incallsend i").css("color","blue");
    }
    else $(".incallsend i").css("color","#a6a6a6")
}

const sendincallMsgHandler = (el, personal) => {
    let msg=$("#incallinputbox").val();
    msg=msg.trim();
    if(msg=='') return;
    $("#incallinputbox").val('');
    sendSignal('message',{'msg':msg,'fullname':fullname,'sender':username},0);
    if(personal==1){
        const index=parseInt($(el).data('number'));
        tabIndicator=index;
        sockets[index].send(JSON.stringify({
            'message' : msg,
            'type' : 1
        }));
    }
}

const commonWork = () => {
    $("#call1").css("width","calc(100% - 400px)");
    $(".hidden-window").css("display","block");
}