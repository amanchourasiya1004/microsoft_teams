$("#call1").css("display","block");
var mapPeers={};
var localStream=new MediaStream(),shareStream=new MediaStream();
var userMedia;
var wb;

const timetoShow = (time) => {
    let today=new Date();
    var newtime=time;
    var msgtime="";
    var hours=newtime.getHours();
    var minutes=newtime.getMinutes();
    var amorpm='';
    if(hours>=12){
        if(hours>12) hours-=12;
        amorpm=" PM";
    }
    else amorpm=" AM";
    hours=hours.toString();
    minutes=minutes.toString();
    if(hours.length<2) hours='0'+hours;
    if(minutes.length<2) minutes='0'+minutes;
    msgtime=hours+":"+minutes+amorpm;
    let msgdate=newtime.toString();
    let ans='';
    if(today.getDate()-newtime.getDate()>6){
        ans=msgdate.substring(8,10)+' '+msgdate.substring(4,7);
    }
    else{
        ans=msgdate.substring(0,3);
    }
    ans+=' '+msgtime;
    return ans;
}

const setUpMemberIcons = (member,index) => {
    $("#userIcon-"+member).css('background',usersdata[index][1]);
    $("#userIcon-"+member).css('color',usersdata[index][2]);
    $("#userIcon-"+member).html(usersdata[index][0][0].toUpperCase());
}

const selfTileSetUp = (index) => {
    $(".tiles").attr("id","tiles-"+username);
    $(".tiles .wrapper-tiles").attr("id","wrapper-tiles-"+username);
    $(".tiles .user").attr("id","userIcon-"+username);
    $(".tiles .user").css("background",usersdata[index][1]);
    $(".tiles .user").css("color",usersdata[index][2]);
    $(".tiles .user").html(usersdata[index][0][0].toUpperCase());
    $(".tiles .tileScreen").attr("id","tileScreen-"+username);
    $(".tiles video").attr("id","tileScreenVideo-"+username);
}
let otheruser=members[0];
let index_oth=0;
if(members[0]==username) {
    otheruser=members[1];
    index_oth=1;
}

$(".main-video-container .user").attr("id","userIcon-"+otheruser);
setUpMemberIcons(otheruser,index_oth);
$(".main-video-container .tileScreen").attr("id","tileScreen-"+otheruser);
$(".main-video-container video").attr("id","tileScreenVideo-"+otheruser);

for(let x=0;x<members.length;x++){
    if(members[x]==username){
        index_oth=x; break;
    }
}
selfTileSetUp(index_oth);

for(let x=0;x<members.length;x++){
    if(members[x]==otheruser || members[x]== username) continue;
    $(".tiles-container").append(tileCreator(members[x]));
    setUpMemberIcons(members[x],x);
}

localStream=new MediaStream();

var localVideo=document.getElementById("tileScreenVideo-"+username);
var btnToggleAudio=$("#mic-callScreen");
var btnToggleVideo=$("#videocam-callScreen");
var endpoint=ws_scheme + window.location.host + "/ws/call/"+groupname+"/";

wb=new WebSocket(endpoint);
wb.addEventListener("open",e=>{
    console.log("Group Call websocket opened.");
    userMedia=navigator.mediaDevices.getUserMedia(constraints)
        .then(stream =>{
            localStream=stream;
            localVideo.srcObject=stream;
            localVideo.muted=true;
            var audioTrack=stream.getAudioTracks();
            var videoTrack=stream.getVideoTracks();
            audioTrack[0].enabled=true;
            videoTrack[0].enabled=true;
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
    console.log("Group call connection closed");
});
wb.addEventListener("error",e=>{
    console.log("error occured");
});

const hangupgroup = () => {
    for(const item in mapPeers){
        mapPeers[item][0].close();
        delete(mapPeers[item]);
    }
    sendSignal('close-group',{'msg':'The connection has closed.','sender':username},0);
    wb.close();
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    shareStream.getTracks().forEach(function(track) {
        track.stop();
    });
    window.location.pathname='/chat/';
}