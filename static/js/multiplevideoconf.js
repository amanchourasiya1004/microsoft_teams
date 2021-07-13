const sendSignal = (action, message) =>{
    var jsonStr=JSON.stringify({
        'peer':username,
        'action':action,
        'message':message
    });
    wb.send(jsonStr);
}
var msgList=document.querySelector("#message-list");

var mapPeers={};

const websocketOnMessage = event =>{
    var parsedData=JSON.parse(event.data);
    var peerUsername=parsedData['peer'];
    var action=parsedData['action'];
    if(action=='tracksData'){
        const videoAction=parsedData['message']['videoTrack'];
        const videoToChange="#tileScreen-"+peerUsername;
        const userIconChange="#userIcon-"+peerUsername;
        if(videoAction==true){
            $(videoToChange).css("display","flex");
            $(userIconChange).css("display","none");
        }
        else{
            $(videoToChange).css("display","none");
            $(userIconChange).css("display","block");
        }
        return;
    }
    if(username==peerUsername) {
        return;
    }
    var receiver_channel_name=parsedData['message']['receiver_channel_name'];
    if(action=='new-peer'){
        createOfferer(peerUsername,receiver_channel_name);
        return;
    }
    if(action=='new-offer'){
        var offer=parsedData['message']['sdp']
        createAnswerer(offer,peerUsername,receiver_channel_name);
        return;
    }
    if(action=='new-answer'){
        var answer=parsedData['message']['sdp']
        var peer=mapPeers[peerUsername][0];
        peer.setRemoteDescription(answer);
        return;
    }
}

var localStream;
var userMedia;
var wb;

const sendTracksData = (audioInfo, videoInfo) => {
    sendSignal('tracksData',{'audioTrack':audioInfo,'videoTrack':videoInfo});
}

const callClickBtnHandler = (otheruser) => {
    $("#userhandler").css("display", "none");
    $("#call1").css({"display": "block"});
    $(".side-content").css({"display": "none"});
    var endpoint="ws://" + window.location.host + "/ws/call/amanchourasiya/ritesh/";
    wb=new WebSocket(endpoint);
    wb.addEventListener("open",e=>{
        sendSignal('new-peer',{});
    });
    wb.addEventListener("message",websocketOnMessage);
    wb.addEventListener("close",e=>{
        console.log("connection closed");
    });
    wb.addEventListener("error",e=>{
        console.log("error occured");
    });
    
    localStream=new MediaStream();
    const constraints={
        'video':true, 
        'audio':true
    }
    var localVideo=document.getElementById("tileScreenVideo-"+username);
    var btnToggleAudio=$("#mic-callScreen");
    var btnToggleVideo=$("#videocam-callScreen");
    userMedia=navigator.mediaDevices.getUserMedia(constraints)
        .then(stream =>{
            localStream=stream;
            localVideo.srcObject=stream;
            localVideo.muted=true;
            var audioTrack=stream.getAudioTracks();
            var videoTrack=stream.getVideoTracks();
            audioTrack[0].enabled=true;
            videoTrack[0].enabled=true;
            sendTracksData(audioTrack[0].enabled, videoTrack[0].enabled);
            btnToggleAudio.click(()=>{
                micClickListener(btnToggleAudio);
                audioTrack[0].enabled=!audioTrack[0].enabled;
                sendTracksData(audioTrack[0].enabled, videoTrack[0].enabled);
            });
            btnToggleVideo.click(()=>{
                videocamClickListener(btnToggleVideo);
                videoTrack[0].enabled=!videoTrack[0].enabled;
                sendTracksData(audioTrack[0].enabled, videoTrack[0].enabled);
            });
        })
        .catch(error=>{
            console.log(error);
            console.log("Error accessing media devices");
        })
}
    
const createOfferer = (peerUsername,rec_channel) =>{
    var peer=new RTCPeerConnection();
    addLocalTracks(peer);
    var dc=peer.createDataChannel('channel');
    dc.addEventListener('message',dcOnMessage);
    var remoteVideo=createVideo(peerUsername);
    setOnTrack(peer,peerUsername);
    mapPeers[peerUsername]=[peer,dc]
    peer.addEventListener("iceconnectionstatechange",()=>{
        var iceconnectionState=peer.iceConnectionState;
        if(iceconnectionState==='failed' || iceconnectionState==='disconnected'||iceconnectionState==='close'){
            delete(mapPeers[peerUsername]);
            if(iceconnectionState!='close') peer.close();
            removeVideo(remoteVideo);
        }
    });
    peer.addEventListener("icecandidate",(event)=>{
        if(event.candidate){
            return;
        }
        console.log("Sending offer");
        sendSignal('new-offer',{
            'sdp':peer.localDescription,
            'receiver_channel_name':rec_channel
        });
    });
    peer.createOffer().then(o=>peer.setLocalDescription(o))
        .then(()=>{
            console.log('local description set successfully');
        });
}   

const addLocalTracks = (peer) =>{
    localStream.getTracks().forEach(track => {
        peer.addTrack(track,localStream);
    });
}

const dcOnMessage = (event) => {
    var message=event.data;
    var li=document.createElement("li");
    // const toAppend=peerUsername+" : "+message;
    li.appendChild(document.createTextNode(message));
    msgList.appendChild(li);
}

const videoElementCreator = (iduser) => {
    var element=$('<div></div>', { id: "tileScreen-" + iduser, class: "tileScreen"});
    var videoelement=$('<video></video>', { id: "tileScreenVideo-" + iduser});
    element.append(videoelement);
    return element;
}

const tileCreator = (iduser) => {
    var element=$('<div></div>', { id: "tiles-" + iduser, class: "tiles"});
    var wrapperElement=$('<div></div>', { id: "wrapper-tiles-" + iduser, class: "wrapper-tiles"});
    var userIcon=$('<div></div>', { id: "userIcon-" + iduser, class: "user text-center"});
    userIcon.text('A');
    wrapperElement.append(userIcon);
    wrapperElement.append(videoElementCreator(iduser));
    element.append(wrapperElement);
    return element;
}

const createVideo = (peerUsername) =>{
    $(".side-content").css("display","flex");
    var remotePeerTile=$(".tiles-container");
    remotePeerTile.append(tileCreator(peerUsername));
    var id="#tileScreen-"+peerUsername;
    $(id).css("display","none");
    id="#tileScreenVideo-"+peerUsername;
    return $(id);
}

const removeTrackHandler = (e) => {
    console.log("track removed");
}

const setOnTrack = (peer,peerUsername) => {
    var remoteStream=new MediaStream();
    var remoteVideo=document.getElementById("tileScreenVideo-"+peerUsername);
    remoteVideo.autoplay=true;
    remoteVideo.playsinline=true;
    remoteVideo.srcObject=remoteStream;
    const idIcon="#userIcon-"+peerUsername;
    const id="#tileScreen-"+peerUsername;
    peer.addEventListener("track", async (event) => {
        remoteStream.addTrack(event.track,remoteStream);
        $(id).css("display","flex");
        $(idIcon).css("display","none");
    });
}

const removeVideo = (remoteVideo) =>{
    console.log("removal required");
}

const createAnswerer = (offer,peerUsername,receiver_channel_name) =>{
    var peer=new RTCPeerConnection();
    addLocalTracks(peer);
    var remoteVideo=createVideo(peerUsername);
    setOnTrack(peer,peerUsername);
    peer.addEventListener('datachannel',(e)=>{
        peer.channel=e.channel;
        peer.channel.addEventListener("open",()=>{
            console.log("Connection opened");
        })
        peer.channel.addEventListener("message",dcOnMessage);
        mapPeers[peerUsername]=[peer,peer.channel]
    });
    peer.addEventListener("iceconnectionstatechange",()=>{
        var iceconnectionState=peer.iceConnectionState;
        if(iceconnectionState==='failed' || iceconnectionState==='disconnected'||iceconnectionState==='close'){
            delete(mapPeers[peerUsername]);
            if(iceconnectionState!='close') peer.close();
            removeVideo(remoteVideo);
        }
    });
    peer.addEventListener("icecandidate",(event)=>{
        if(event.candidate){
            return;
        }
        sendSignal('new-answer',{
            'sdp':peer.localDescription,
            'receiver_channel_name':receiver_channel_name
        });
    });
    peer.setRemoteDescription(offer).then(()=>{
        return peer.createAnswer();
    })
    .then(a=>{
        console.log("answer set successfully");
        peer.setLocalDescription(a);
    });
}