const personalChatHandler = (data,index) => {
    if(data.msg_type==4){
        if(data.sender!=username){
            hangup();
        }
        return;
    }
    if(data.msg_type==3){
        if(data.sender!=username){
            $(".caller-info .user").css("background",chats[index][6]);
            $(".caller-info .user").css("color",chats[index][7]);
            $(".caller-info .user").html(chats[index][5][0].toUpperCase());
            $(".cut-call").attr("data-call",data.sender);
            $(".caller-name").text(chats[index][5])
            $(".accept-call").attr("data-call",data.sender);
            $(".incallsend").attr("data-number",index);
            let callName=$(".call-name");
            if(data.message=="Video Call Invitation") {
                $(".accept-call").data("type","Video");
                callName.html('Video Call Invitation');
                $(".call-type i").html('videocam');
            }
            else {
                $(".accept-call").data("type","Voice");
                callName.html('Voice Call Invitation');
                $(".call-type i").html('call');
            }
            $('#exampleModal').modal({backdrop: 'static', keyboard: false})
        }
        return;
    }
    const msgtime=timetoShow(new Date());
    if(data.msg_type==2){
        $($(".filterDiscussions p")[index]).html("<i>Photo</i>");
        $($(".mainmsgbox")[index]).append(addMessageHandler(data.msg_type,data.sender,data.message,chats[index][5],msgtime,0));
        let idx=$($(".babble")[index]).attr("id");
        let len=$("#"+idx+" .imageshared").length;
        len-=1;
        $($("#"+idx+" .imageshared")[len]).attr('src', data.message);
    }
    else{
        $($(".filterDiscussions p")[index]).html(data.message);
        $($(".filterDiscussions p")[index]).css("font-style","normal");
        $($(".mainmsgbox")[index]).append(addMessageHandler(data.msg_type,data.sender,data.message,chats[index][5],msgtime,0));
    }
    scrollToBottom($(".msgboxcontainer")[index]);
}

const callSideBarContentUpdater = (data,index) => {
    let message=callInvitationText(data.sender,data.message);
    $($(".filterDiscussions p")[index]).html(message);
    $($(".filterDiscussions p")[index]).css("font-style","italic");
    if(data.sender!=username){
        $("#sidebar-"+data.groupname+" p").append(meetingjoin(data.groupname));
    }
}

const groupChatHandler = (data,index) => {
    if(data.msg_type==4){
        // if(data.actual_sender!=username){
        //     hangup();
        // }
        return;
    }
    const msgtime=timetoShow(new Date());
    if(data.msg_type==2){
        $($(".filterDiscussions p")[index]).html("<i>Photo</i>");
        $($(".mainmsgbox")[index]).append(addMessageHandler(data.msg_type,data.sender,data.message,chats[index][5],msgtime,1));
        let idx=$($(".babble")[index]).attr("id");
        let len=$("#"+idx+" .imageshared").length;
        len-=1;
        $($("#"+idx+" .imageshared")[len]).attr('src', data.message);
    }
    else{
        if(data.msg_type==1){
            $($(".filterDiscussions p")[index]).html(data.message);
            $($(".filterDiscussions p")[index]).css("font-style","normal");
        }
        else callSideBarContentUpdater(data,index);
        $($(".mainmsgbox")[index]).append(addMessageHandler(data.msg_type,data.sender,data.message,chats[index][5],msgtime,1));
        if(data.msg_type==3 && data.sender!=username){
            let len=$("#"+data.groupname+" .date p").length-1;
            console.log(len);
            $($("#"+data.groupname+" .date p")[len]).append(meetingjoin(data.groupname));
        }
    }
    scrollToBottom($(".msgboxcontainer")[index]);
}