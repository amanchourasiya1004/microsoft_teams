const updateMainUI = (index) => {
    for(var i=0;i<sockets.length;i++){
        $($(".filterDiscussions")[i]).removeClass("active");
    }
    $($(".filterDiscussions")[index]).addClass("active");
}

const updateMainUIBox = (index) => {
    for(var i=0;i<sockets.length;i++){
        $($(".babble")[i]).removeClass("active show");
    }
    $($(".babble")[index]).addClass("active show");
}

const newuserhandler = (name,fullname,backIcon,fontIcon,dob,date,login) => {
    users.push([name,fullname,backIcon,fontIcon])
    $("#list-users").append('<option value="' +name + '" data-name="'+fullname+'" data-back="'+backIcon+'" data-font="'+fontIcon+'" data-dob="'+dob+'" data-joined="'+date+'" data-login="'+login+'"/>');
}

const twoLengthConverter = (val) => {
    if(val.length<2) return '0'+val;
    return val;
}

const timeToString = () => {
    const day=new Date();
    let year=day.getUTCFullYear().toString();
    let month=day.getUTCMonth();
    let days=day.getUTCDate().toString();
    days=twoLengthConverter(days);
    month+=1;
    month=month.toString();
    month=twoLengthConverter(month);
    let hours=day.getUTCHours().toString();
    hours=twoLengthConverter(hours);
    let minutes=day.getUTCMinutes().toString();
    minutes=twoLengthConverter(minutes);
    let seconds=day.getUTCSeconds().toString();
    seconds=twoLengthConverter(seconds);
    return year+'-'+month+'-'+days+' '+hours+':'+minutes+':'+seconds;
}

const friendrequest = (e) => {
    const data=JSON.parse(e.data);
    var otheruser;
    var request_fullname;
    let backIcon=data.backIcon;
    let fontIcon=data.fontIcon;
    if(data.msgtype==='newuser'){
        if(data.sender===username) return;
        for(var u=0;u<users.length;u++){
            if(users[u][0]===data.sender) return;
        }
        newuserhandler(data.sender,data.fullname,backIcon,fontIcon,data.dob,data.date_joined,data.last_login);
        return;
    }
    let login,joined,dob;
    if(data.sender===username){
        otheruser=data.receiver;
        request_fullname=data.receiverFullname;
        login=data['activity']['last_login'];
        joined=data['activity']['date_joined'];
        dob=data['activity']['dob'];
    }
    else if(data.receiver===username){
        otheruser=data.sender;
        request_fullname=data.senderFullname;
        backIcon=data.selfBack;
        fontIcon=data.selfFont;
        login=data['activitySelf']['last_login'];
        joined=data['activitySelf']['date_joined'];
        dob=data['activitySelf']['dob'];
    }
    else {
        return;
    }
    const socket = new WebSocket(ws_scheme + window.location.host + "/ws/personal/chat/" + otheruser +"/"+username+"/");
    const index=sockets.length;
    requestMap[otheruser]=index;
    sockets.push(socket);
    sockets[index].addEventListener('message',function(event){
        messageEventHandler(event);
    });
    let day=new Date(); 
    chats.push([otheruser,'',new Date().toString(),0,data.sender,request_fullname,backIcon,fontIcon,dob,joined,login,timeToString()]);
    const idchat=chats[index][0];
    if(length===0){
        $(".no-chats").css("display","none");
        $("#userexists").css("display","block");
    }
    day=day.toString(); day=day.substring(0,3);
    mainUIContentCreator(index,idchat,chats[index][3],chats[index][1],chats[index][4],chats[index][5],day,0);
    mainUIBoxContentCreator(index,request_fullname,otheruser,0);
    if(data.sender===username || chats.length==0){
        updateMainUI(index);
        updateMainUIBox(index);
    }
    $($(".mainmsgbox")[sockets.length-1]).append(addMessageHandler(0,data.sender,'',request_fullname,0));
}

const serverconnect = new WebSocket(ws_scheme + window.location.host + "/ws/server/contact/");
serverconnect.addEventListener('message',function(e){
    friendrequest(e);
});

serverconnect.addEventListener("open",e=>{
    serverconnect.send(JSON.stringify({
        'msgtype':'newuser',
        'sender':username,
        'fullname':fullname,
        'backIcon':backIcon,
        'fontIcon':fontIcon,
        'dob':dob,
        'date_joined':date_joined,
        'last_login':last_login
    }));
});

const requestHandler = (el) => {
    if($(el).css("background-color")!="rgb(0, 123, 255)"){
        return;
    }
    const friend=$(".search-res").val();
    let matchedFilter=$('#list-users option').filter(function() {
        return this.value == friend;
    });
    let fullname_sender = matchedFilter.data('name');
    let backIconFriend = matchedFilter.data('back');
    let fontIconFriend = matchedFilter.data('font');
    let loginFriend = matchedFilter.data('login');
    let dateFriend = matchedFilter.data('joined');
    let dobFriend = matchedFilter.data('dob');
    $.ajax({
        type : 'GET',
        url : "/chat/create/",
        data : {'friend' : friend,'sender' : username},
        success : function(response){
            if(response['error']==0){
                if(response['exists']==0){
                    serverconnect.send(JSON.stringify({
                        'msgtype':'friendrequest',
                        'sender':username,
                        'receiver':friend,
                        'senderFullname':fullname,
                        'receiverFullname':fullname_sender,
                        'backIcon':backIconFriend,
                        'fontIcon':fontIconFriend,
                        'selfBack':backIcon,
                        'selfFont':fontIcon,
                        'activity':{'dob':dobFriend,'last_login':loginFriend,'date_joined':dateFriend},
                        'activitySelf':{'dob':dob,'last_login':last_login,'date_joined':date_joined}
                    }));
                }
                else{
                    const index=requestMap[friend];
                    updateMainUI(index);
                    updateMainUIBox(index);
                }
            }
            $(".search-res").val('');
            $(".search-res").blur();
            $(".start-conversation").css({"background-color" : "#e8e8e8", "color" : 'rgba(0, 0, 0, 0.5)',"cursor":"not-allowed"});
        },
        error : function(response){
            console.log("Error happened");
        }
    });
}