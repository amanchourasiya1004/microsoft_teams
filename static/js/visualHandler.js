var firstChar,backMainBar,fontMainBar;

const meetingjoin = (idchat) => {
    let spanelem=$("<span></span>",{class:"meetingspan"});
    spanelem.text("Join them");
    spanelem.click(()=>{
        window.location.pathname='/group/meeting/'+idchat+'/';
    });
    return spanelem;
}

const voiceCallHandler = (el) => {
    const index=$(el).attr("data-number");
    let isgroup=chats[index].length-1;
    isgroup=chats[index][isgroup];
    tabIndicator=index;
    if(isgroup){
        sockets[index].send(JSON.stringify({
            'type' : 3,
            'message': 'Voice Call Invitation',
            'sender': username
        }));
        window.location.pathname='/group/meeting/'+chats[index][0]+'/';
        return;
    }
    sockets[index].send(JSON.stringify({
        'type' : 3,
        'message': 'Voice Call Invitation'
    }));
    $(".incallsend").attr("data-number",index);
    callClickBtnHandler(chats[index][0],chats[index][5][0].toUpperCase(),chats[index][6],chats[index][7],false);
}

const videoCallHandler = (el) => {
    const index=$(el).attr("data-number");
    let isgroup=chats[index].length-1;
    isgroup=chats[index][isgroup];
    tabIndicator=index;
    if(isgroup){
        sockets[index].send(JSON.stringify({
            'type' : 3,
            'message': 'Video Call Invitation',
            'sender': username
        }));
        window.location.pathname='/group/meeting/'+chats[index][0]+'/';
        return;
    }
    sockets[index].send(JSON.stringify({
        'type' : 3,
        'message': 'Video Call Invitation'
    }));
    $(".incallsend").attr("data-number",index);
    callClickBtnHandler(chats[index][0],chats[index][5][0].toUpperCase(),chats[index][6],chats[index][7],true);
}

const acceptCall = (el) => {
    let callFromUser=$(el).data('call');
    const index=requestMap[callFromUser];
    let callType=$(el).data('type');
    let videoEnable;
    if(callType=='Video') videoEnable=true;
    else videoEnable=false;
    callClickBtnHandler(callFromUser,chats[index][5][0].toUpperCase(),chats[index][6],chats[index][7],videoEnable);
}

const cutIncomingCall = (el) => {
    const callFromUser=$(el).attr("data-call");
    const index=requestMap[callFromUser];
    sockets[index].send(JSON.stringify({
        'type' : 4,
        'message': 'Call denied'
    }));
}

const callInvitationText = (sender, text) => {
    let message='';
    if(sender==username) message='You invited the group for a '+text.substring(0,10);
    else message="Hey, your group members are over a "+text.substring(0,10);
    return message;
}

const chatHandler = (msgtype,chat,sender,name,isgroup) => {

    if(msgtype==1) return "<p>"+chat+"</p>";
    if(msgtype==2) return "<p style='font-style:italic'>Photo</p>";
    let invitingtext='';
    if(msgtype==0){
        if(isgroup==1){
            if(sender==username) invitingtext='You created <b>'+name+'</b> group.';
            else invitingtext='You are invited to be a member of this group.';
        }
        else{
            if(sender==username) invitingtext='You invited '+name+' to start a conversation';
            else invitingtext='You are invited to start a conversation';
        }
    }
    else invitingtext=callInvitationText(sender,chat);
    return "<p style='font-style:italic;'>"+invitingtext+"</p>";
}

const dataCreator = (user) => {
    return '<a href="#">'+
                '<div class="user text-center mainBarUserIcon utilityIcon"></div>'+
            '</a>'+
            '<div class="data">'+
                '<h5><a href="#">'+user+'</a></h5>'+
                '<span>Active now</span>'+
            '</div>';
}

const callBtnCreator = () => {
    return '<button class="btn connect d-md-block d-none voicecall-btn" name="1" onclick="voiceCallHandler(this)"><i class="material-icons md-30">phone_in_talk</i></button>'+
            '<button class="btn connect d-md-block d-none videocall-btn" name="1" onclick="videoCallHandler(this)"><i class="material-icons md-36">videocam</i></button>'+
            '<button class="btn d-md-block d-none info-user" onclick="userInfoHandler(this)"><i class="material-icons md-30">info</i></button>';
}

var mainUI=$("#chats");
var mainUIBox=$("#nav-tabContent");

const topBarCreator = (user) => {
    return "<div class='top'>"+
                "<div class='container'>"+
                    "<div class='col-md-12'>"+
                        "<div class='inside'>"+
                            dataCreator(user)+
                            callBtnCreator()+
                        "</div>"+
                    "</div>"+
                "</div>"+
            "</div>";
}

const messageSendBoxCreator = () => {
    return '<div class="container">'+
                '<div class="col-md-12">'+
                    '<div class="bottom">'+
                        '<div class="position-relative w-100">'+
                            '<textarea class="form-control inputmsg" placeholder="Start typing for reply..." rows="1"></textarea>'+
                            '<button class="btn emoticons"><i class="material-icons">insert_emoticon</i></button>'+
                            '<button class="btn sendmsg send" onclick="sendMsgHandler(this)"><i class="material-icons">send</i></button>'+
                        '</div>'+
                        '<label>'+
                            '<input type="file" accept="image/*" onclick="indexFinder(this)">'+
                            '<span class="btn attach d-sm-block d-none"><i class="material-icons">image</i></span>'+
                        '</label>'+ 
                    '</div>'+
                '</div>'+
            '</div>';
}
                
const contentCreator = () => {
    return '<div class="content msgboxcontainer">'+
                '<div class="container">'+
                    '<div class="col-md-12 mainmsgbox">'+
                    '</div>'+
                '</div>'+
            '</div>';
}
const msgBoxCreator = (user) => {
    return '<div class="babble tab-pane fade" role="tabpanel">'+
                '<div class="chat">'+
                    topBarCreator(user)+
                    contentCreator()+
                    messageSendBoxCreator()+
                '</div>'+
            '</div>';
}

const userIconUpdater = (el) => {
    el.css("background",backMainBar);
    el.css("color",fontMainBar);
    el.html(firstChar);
}

const mainUIBoxContentCreator = (index,idchat,name) => {
    firstChar=chats[index][5][0].toUpperCase();
    backMainBar=chats[index][6];
    fontMainBar=chats[index][7];
    mainUIBox.append(msgBoxCreator(idchat));
    $($(".babble")[0]).addClass('active show');
    $($(".babble")[index]).attr('id', name);
    $($(".sendmsg")[index]).attr('data-number', index);
    $($(".voicecall-btn")[index]).attr('data-number', index);
    $($(".videocall-btn")[index]).attr('data-number', index);
    $($('input[type="file"]')[index]).attr("data-number",index);
    $($('.info-user')[index]).attr("data-number",index);
    userIconUpdater($($(".mainBarUserIcon")[index]));
    $($('input[type="file"]')[index]).change(function(e){
        onChangeInputHandler(e);
    });
}

for(var i = 0; i < chats.length; i++){
    const idchat=chats[i][5];
    mainUIBoxContentCreator(i,idchat,chats[i][0]);
}

const mainUIContentCreator = (index,idchat,msgtype,chat,sender,name,day,isgroup) => {
    firstChar=chats[index][5][0].toUpperCase();
    backMainBar=chats[index][6];
    fontMainBar=chats[index][7];
    mainUI.append(
        '<a class="filterDiscussions all unread single" data-toggle="list" role="tab">'+
            '<div class="user text-center sidebarUserIcon utilityIcon"></div>'+
            '<div class="data">'+
                '<h5>'+name+'</h5>'+
                '<span>'+day+'</span>'+
                chatHandler(msgtype,chat,sender,name,isgroup)+
            '</div>'+
        '</a>'
    );
    $($(".filterDiscussions")[index]).attr('href', "#"+idchat);
    $($(".filterDiscussions")[index]).attr('id', "sidebar-"+idchat);
    $($(".filterDiscussions")[0]).addClass('active');
    userIconUpdater($($(".sidebarUserIcon")[index]));
    if(msgtype==3 && isgroup==1 && sender!=username){
        $("#sidebar-"+idchat+" p").append(meetingjoin(idchat));
    }
}

const timeFormatConverter = (time) => {
    let x=time[0]+time[1];
    x=parseInt(x);
    if(x>=12){
        if(x>12) x-=12;
        x=x.toString();
        if(x.length<2) x='0'+x;
        for(var u=2;u<time.length;u++) x+=time[u];
        x+=" PM";
        return x;
    }
    time+=" AM";
    return time;
}

const dayFinder = (time) => {
    var year=time.substring(0,4);
    var date=time.substring(8,10);
    var month=time.substring(5,7);
    var newtime=month+'/'+date+'/'+year;
    newtime+=" "+timeFormatConverter(time.substring(11,19))+" UTC";
    newtime=new Date(newtime);
    return newtime;
}

for(i = 0; i < chats.length; i++){
    let isgroup=chats[i].length-1;
    isgroup=chats[i][isgroup];
    const idchat=chats[i][0];
    let msgdate=dayFinder(chats[i][2]);
    let strdate=msgdate.toString();
    let today=new Date();
    let finalans='';
    if(today.getDate()-msgdate.getDate()>6){
        finalans=strdate.substring(8,10)+' '+strdate.substring(4,7);
    }
    else{
        finalans=strdate.substring(0,3);
    }
    mainUIContentCreator(i,idchat,chats[i][3],chats[i][1],chats[i][4],chats[i][5],finalans,isgroup);
}


const imageorparagraph = (msgtype, message) => {
    if(msgtype==1) return '<p>'+message+'</p>';
    return '<img src="#" class="imageshared" >';
}

const smallestBlock = (sender,message,time,msgtype,isgroup) => {
    if(sender===username){
        return '<div class="text-group me">'+
                    '<div class="text me">'+
                        imageorparagraph(msgtype,message)+
                    '</div>'+
                '</div>'+
                '<span>'+time+'</span>';
    }
    let grouphandler='';
    if(isgroup==1){
        grouphandler='<span>'+sender+'</span>';
    }
    return '<div class="text-group">'+
                '<div class="text">'+
                    imageorparagraph(msgtype,message)+
                '</div>'+
            '</div>'+
            grouphandler+
            '<span>'+time+'</span>';
}

const utAddMessage = (sender,message,time,msgtype,isgroup) => {
    return '<div class="text-main">'+smallestBlock(sender,message,time,msgtype,isgroup)+'</div>'
}

const addMessageHandler = (msgtype,sender,message,name,time,isgroup) => {
    if(msgtype==0 || msgtype==3){
        return '<div class="date">'+
                    '<span>'+chatHandler(msgtype,message,sender,name,isgroup)+'</span>'+
                '</div>';
    }
    if(sender===username){
        return '<div class="message me">'+utAddMessage(sender,message,time,msgtype,isgroup)+'</div>';
    }
    return '<div class="message">'+utAddMessage(sender,message,time,msgtype,isgroup)+'</div>';
}

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