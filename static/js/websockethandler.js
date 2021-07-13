var sockets=[]
for(var i = 0; i < chats.length; i++){
    const otheruser=chats[i][0];
    let isgroup=chats[i].length-1;
    isgroup=chats[i][isgroup];
    let socket;
    if(isgroup==0){
        socket = new WebSocket(ws_scheme + window.location.host + "/ws/personal/chat/" + otheruser +"/"+username+"/");
    }
    else{
        socket = new WebSocket(ws_scheme + window.location.host + "/ws/group/chat/" + otheruser+"/");
    }
    sockets.push(socket)
}

var requestMap={};
for(i=0;i<chats.length;i++){
    requestMap[chats[i][0]]=i;
}

const sendMsgHandler = (el) => {    
    const index = parseInt($(el).attr("data-number"));
    let isgroup=chats[index].length-1;
    isgroup=chats[index][isgroup];
    const messageDOM=$($(".inputmsg")[index]);
    tabIndicator = index;
    let message=messageDOM.val();
    message=message.trim();
    if(message==''){
        return;
    }
    if(isgroup==0){
        sockets[index].send(JSON.stringify({
            'message' : message,
            'type' : 1
        }));
    }
    else{
        sockets[index].send(JSON.stringify({
            'message' : message,
            'type' : 1,
            'sender':username,
        }));
    }
    messageDOM.val('');
}

for(i=0;i<sockets.length;i++){
    sockets[i].addEventListener('message',function(e){
        messageEventHandler(e);
    });
}