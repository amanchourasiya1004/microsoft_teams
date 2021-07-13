var mapPeers={};
var localStream=new MediaStream(),shareStream=new MediaStream();
var userMedia;
var videoEnableForCall=true;
var wb;

const tilesClickHandler = (el) => {
    let id=$(el).attr("id");
    id=id.substring(6,id.length);
    console.log(id);
    let userIcon=$("#userIcon-"+id);
    let back=userIcon.css("background");
    let font=userIcon.css("color");
    let text=userIcon.text();
    let tileScreen=$("#tileScreen-"+id);
    let display=[userIcon.css("display"), tileScreen.css("display")];
    let stream=document.getElementById("tileScreenVideo-"+id).srcObject;
    stopSharingHandlerTile(id);
    rePositionElement();
    let mainVideo=mainVideoCreator(id,display[0],display[1],text,back,font);
    mainVideo.autoplay=true;
    mainVideo.playsinline=true;
    mainVideo.srcObject=stream;
}

const sendSignal = (action,message,type) =>{
    var jsonStr=JSON.stringify({
        'type':type,
        'peer':username,
        'action':action,
        'message':message
    });
    wb.send(jsonStr);
}

const sendSignalShare = (action,message,type) =>{
    var jsonStr=JSON.stringify({
        'type':type,
        'peer':"share"+username,
        'action':action,
        'message':message
    });
    wb.send(jsonStr);
}

const addLocalTracks = (peer,stream) =>{
    stream.getTracks().forEach(track => {
        peer.addTrack(track,stream);
    });
}

const sendTracksData = (audioInfo, videoInfo) => {
    sendSignal('tracksData',{'audioTrack':audioInfo,'videoTrack':videoInfo},0);
}

const dcOnMessage = (event) => {
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
        event.track.onunmute = () => {
            remoteStream.addTrack(event.track,remoteStream);
            const type=event.track.kind;
            if(type=="video" && videoEnableForCall==true){
                $(id).css("display","flex");
                $(idIcon).css("display","none");
            }
        }
    });
}

const websocketOnMessage = event =>{
    var parsedData=JSON.parse(event.data);
    var peerUsername=parsedData['peer'];
    var action=parsedData['action'];
    var type=parsedData['type'];
    if(action=='share-screen-close'){
        if("share"+username!=peerUsername){
            stopSharingHandler(peerUsername);
        }
        else{
            shareStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        return;
    }
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
    if(action=='message'){
        const msgtime=timetoShow(new Date());
        $(".hold-incallmsgs").append(incallmsgcreator(parsedData['message']['fullname'],msgtime.substring(4,msgtime.length),parsedData['message']['msg']));
        return;
    }
    if(action=='close-group'){
        hangupgroup();
    }
    if(action=='close'){
        hangup();
    }
    if(username==peerUsername) {
        return;
    }
    if(type==1){
        if("share"+username==peerUsername){
            return;
        }
    }
    var receiver_channel_name=parsedData['message']['receiver_channel_name'];
    if(action=='new-peer'){
        createOfferer(peerUsername,receiver_channel_name,type);
        return;
    }
    if(action=='new-offer'){
        var offer=parsedData['message']['sdp']
        createAnswerer(offer,peerUsername,receiver_channel_name,type);
        return;
    }
    if(action=='new-answer'){
        var answer=parsedData['message']['sdp']
        var peer=mapPeers[peerUsername][0];
        peer.setRemoteDescription(answer);
        return;
    }
}

const callClickBtnHandler = (otheruser,firstChar,back,font,videoEnable) => {
    videoEnableForCall = videoEnable;

    localStream=new MediaStream();
    const constraints={
        'video':true,
        'audio':true
    }

    $("#userhandler").css("display", "none");
    $("#call1").css({"display": "block"});
    $(".main-video-container .user").attr("id","userIcon-"+otheruser);
    $(".main-video-container .user").css("background",back);
    $(".main-video-container .user").css("color",font);
    $(".main-video-container .user").html(firstChar);
    $(".main-video-container .tileScreen").attr("id","tileScreen-"+otheruser);
    $(".main-video-container video").attr("id","tileScreenVideo-"+otheruser);
    $(".tiles").attr("id","tiles-"+username);
    $(".tiles .wrapper-tiles").attr("id","wrapper-tiles-"+username);
    $(".tiles .user").attr("id","userIcon-"+username);
    $(".tiles .user").css("background",backIcon);
    $(".tiles .user").css("color",fontIcon);
    $(".tiles .user").html(fullname[0].toUpperCase());
    $(".tiles .tileScreen").attr("id","tileScreen-"+username);
    $(".tiles video").attr("id","tileScreenVideo-"+username);

    var localVideo=document.getElementById("tileScreenVideo-"+username);
    var btnToggleAudio=$("#mic-callScreen");
    var btnToggleVideo=$("#videocam-callScreen");
    var endpoint=ws_scheme + window.location.host + "/ws/call/"+otheruser+"/"+username+"/";

    if(videoEnable==false){
        videocamClickListener(btnToggleVideo);
    }

    wb=new WebSocket(endpoint);
    wb.addEventListener("open",e=>{
        console.log("Call websocket opened.");
        userMedia=navigator.mediaDevices.getUserMedia(constraints)
            .then(stream =>{
                localStream=stream;
                localVideo.srcObject=stream;
                localVideo.muted=true;
                var audioTrack=stream.getAudioTracks();
                var videoTrack=stream.getVideoTracks();
                audioTrack[0].enabled=true;
                videoTrack[0].enabled=videoEnable;
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
                sendTracksData(audioTrack[0].enabled, videoTrack[0].enabled);
            })
            .then(()=>{
                sendSignal('new-peer',{},0);
            })
            .catch(error=>{
                console.log(error);
                console.log("Error accessing media devices");
            })
    });
    wb.addEventListener("message",websocketOnMessage);
    wb.addEventListener("close",e=>{
        console.log("connection closed");
    });
    wb.addEventListener("error",e=>{
        console.log("error occured");
    });
}
    
const createOfferer = (peerUsername,rec_channel,type) =>{
    var peer=new RTCPeerConnection(pc_config);
    addLocalTracks(peer,localStream);

    var dc=peer.createDataChannel('channel');
    dc.addEventListener('message',dcOnMessage);

    if(type==1){
        rePositionElement();
        let shareVideo=mainVideoCreator(peerUsername,"none","flex",'S',"#000","#fff");
        shareVideo.autoplay=true;
        shareVideo.playsinline=true;
    }

    setOnTrack(peer,peerUsername);
    mapPeers[peerUsername]=[peer,dc]

    peer.addEventListener("close",()=>{
        hangup();
    });

    peer.addEventListener("iceconnectionstatechange",()=>{
        var iceconnectionState=peer.iceConnectionState;
        if(iceconnectionState==='failed' || iceconnectionState==='disconnected'||iceconnectionState==='close'){
            delete(mapPeers[peerUsername]);
            if(iceconnectionState!='close') peer.close();
            hangup();
        }
    });

    peer.addEventListener("icecandidate",(event)=>{
        if(event.candidate){
            return;
        }
        if(type==0){
            sendSignal('new-offer',{
                'sdp':peer.localDescription,
                'receiver_channel_name':rec_channel
            },0);
        }
        else{
            sendSignalShare('new-offer',{
                'sdp':peer.localDescription,
                'receiver_channel_name':rec_channel
            },1);
        }
    });

    peer.createOffer().then(o=>peer.setLocalDescription(o))
        .then(()=>{
            console.log('local description set successfully');
        });
}   

const createAnswerer = (offer,peerUsername,receiver_channel_name,type) =>{
    var peer=new RTCPeerConnection(pc_config);
    if(type==0) addLocalTracks(peer,localStream);
    else addLocalTracks(peer, shareStream);

    if(type==0) setOnTrack(peer,peerUsername);

    peer.addEventListener('datachannel',(e)=>{
        peer.channel=e.channel;
        peer.channel.addEventListener("open",()=>{
            console.log("Connection opened");
        })
        peer.channel.addEventListener("message",dcOnMessage);
        mapPeers[peerUsername]=[peer,peer.channel]
    });

    peer.addEventListener("close",()=>{
        hangup();
    });

    peer.addEventListener("iceconnectionstatechange",()=>{
        var iceconnectionState=peer.iceConnectionState;
        if(iceconnectionState==='failed' || iceconnectionState==='disconnected'||iceconnectionState==='close'){
            delete(mapPeers[peerUsername]);
            if(iceconnectionState!='close') peer.close();
            hangup();
        }
    });

    peer.addEventListener("icecandidate",(event)=>{
        if(event.candidate){
            return;
        }
        if(type==0){
            sendSignal('new-answer',{
                'sdp':peer.localDescription,
                'receiver_channel_name':receiver_channel_name
            },0);
        }
        else{
            sendSignalShare('new-answer',{
                'sdp':peer.localDescription,
                'receiver_channel_name':receiver_channel_name
            },1);
        }
    });

    peer.setRemoteDescription(offer)
    .then(a=>{
        peer.setLocalDescription(a);
    });
}


const hangup = () => {
    for(const item in mapPeers){
        mapPeers[item][0].close();
        delete(mapPeers[item]);
        sendSignal('close',{'msg':'The connection has closed.'},0);
    }
    wb.close();
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    shareStream.getTracks().forEach(function(track) {
        track.stop();
    });
    $("#call1").css("display","none");
    $(".hidden-window").css("display","none");
    $("#userhandler").css("display","block");
    if($("#videocam-callScreen i").html()!='videocam'){
        videocamClickListener($("#videocam-callScreen"));
    }
    if($("#mic-callScreen i").html()!='mic'){
        micClickListener($("#mic-callScreen"));
    }
    if($("#present-callScreen i").css("color")!="rgb(255, 255, 255)"){
        bottomButtonsListener($("#present-callScreen"),'Stop Presenting','Present Screen');
    }
}

// for share screen

const tileCreator = (iduser) => {
    var element=$('<div></div>', { id: "tiles-" + iduser, class: "tiles"});
    element.click(()=>{
        tilesClickHandler(element);
    });
    var wrapperElement=$('<div></div>', { id: "wrapper-tiles-" + iduser, class: "wrapper-tiles"});
    var userIcon=$('<div></div>', { id: "userIcon-" + iduser, class: "user text-center"});
    userIcon.text('A');
    wrapperElement.append(userIcon);
    wrapperElement.append(videoElementCreator(iduser));
    element.append(wrapperElement);
    return element;
}

const rePositionElement = () => {
    const idUserIcon=$(".main-video-tile .user").attr("id");
    const usable=idUserIcon.substring(9,idUserIcon.length);
    let stream=document.getElementById("tileScreenVideo-"+usable).srcObject;
    let displayProp=[$("#userIcon-"+usable).css('display'),$("#tileScreen-"+usable).css('display')]
    let value=$(".main-video-tile .user").text();
    let back=$(".main-video-tile .user").css("background");
    let font=$(".main-video-tile .user").css("color");
    $(".main-video-tile .user").detach();
    $(".main-video-tile .tileScreen").detach();
    $(".tiles-container").append(tileCreator(usable))
    $("#userIcon-"+usable).css('display',displayProp[0]);
    $("#userIcon-"+usable).css('background',back);
    $("#userIcon-"+usable).css('color',font);
    $("#userIcon-"+usable).html(value);
    $("#tileScreen-"+usable).css('display',displayProp[1]);
    var videoElement=document.getElementById("tileScreenVideo-"+usable);
    videoElement.autoplay=true;
    videoElement.playsinline=true;
    videoElement.srcObject=stream;
}

const videoElementCreator = (iduser) => {
    var element=$('<div></div>', { id: "tileScreen-" + iduser, class: "tileScreen"});
    var videoelement=$('<video></video>', { id: "tileScreenVideo-" + iduser});
    element.append(videoelement);
    return element;
}

const mainVideoCreator = (iduser,userIconDisplay,tileScreenDisplay,value,back,font) => {
    let userIcon=$('<div></div>', { id: "userIcon-" + iduser, class: "user text-center"});
    userIcon.html(value);
    userIcon.css("color",font);
    userIcon.css("background",back);
    let videoElement=videoElementCreator(iduser);
    $(".main-video-tile").append(userIcon);
    $(".main-video-tile").append(videoElement);
    $("#userIcon-"+iduser).css("display",userIconDisplay);
    $("#tileScreen-"+iduser).css("display",tileScreenDisplay);
    videoElement=document.getElementById("tileScreenVideo-"+iduser);
    return videoElement;
}

const stopSharingHandlerTile = (peerUsername) => {
    let tiles=$(".tiles-container .tiles");
    for(var u=0; u<tiles.length; u++){
        let idUserIcon=$(tiles[u]).attr("id");
        idUserIcon=idUserIcon.substring(6,idUserIcon.length);
        if(idUserIcon==peerUsername){
            $(tiles[u]).remove();
            return;
        }
    }
}

const stopSharingHandlerMain = () => {
    $(".main-video-tile .user").detach();
    $(".main-video-tile .tileScreen").detach();
    let len=$(".tiles").length;
    let tileConcerned=$($(".tiles .user")[len-1]);
    const idUserIcon=tileConcerned.attr("id");
    const value=tileConcerned.text();
    const font=tileConcerned.css("color");
    const back=tileConcerned.css("background");
    const usable=idUserIcon.substring(9,idUserIcon.length);
    let stream=document.getElementById("tileScreenVideo-"+usable).srcObject;
    let displayProp=[$("#userIcon-"+usable).css('display'),$("#tileScreen-"+usable).css('display')]
    $($(".tiles")[len-1]).detach();
    let videoElement=mainVideoCreator(usable,displayProp[0],displayProp[1],value,back,font);
    videoElement.autoplay=true;
    videoElement.playsinline=true;
    videoElement.srcObject=stream;
}

const stopSharingHandler = (peerUsername) => {
    let idMainVideo=$(".main-video-tile .user").attr("id");
    idMainVideo=idMainVideo.substring(9,idMainVideo.length);
    if(idMainVideo==peerUsername) stopSharingHandlerMain();
    else stopSharingHandlerTile(peerUsername);
}

const shareScreen = () => {
    shareStream = new MediaStream();
    const constraints={
        'video':true
    }
    userMedia=navigator.mediaDevices.getDisplayMedia(constraints)
        .then(stream =>{
            stream.getVideoTracks()[0].onended = function () {
                bottomButtonsListener($("#present-callScreen"),'Stop Presenting','Present Screen');
                sendSignalShare('share-screen-close',{},1);
            };
            rePositionElement();
            var shareVideoElement=mainVideoCreator("share"+username,"none","flex","S","#000","#fff");
            shareVideoElement.autoplay=true;
            shareVideoElement.playsinline=true;
            shareStream=stream;
            shareVideoElement.srcObject=stream;
            shareVideoElement.muted=true;
            var videoTrack=stream.getVideoTracks();
            videoTrack[0].enabled=true;
        })
        .then(()=>{
            sendSignalShare('new-peer',{},1);
        })
        .catch(error=>{
            console.log(error);
            console.log("Error accessing media devices");
        })
};