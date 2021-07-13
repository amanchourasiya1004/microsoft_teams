const userInfoHandler = (el) => {
    const index=$(el).attr("data-number");
    let isgroup=chats[index].length-1;
    isgroup = chats[index][isgroup];
    if(isgroup==1){
        groupInfoHandler(index);
        return;
    }
    let fullname=chats[index][5];
    let username=chats[index][0];
    let dob=chats[index][8];
    dob=dob.substring(8,10)+' - '+dob.substring(5,7)+' - '+dob.substring(0,4)
    let date_joined=timetoShow(dayFinder(chats[index][9]));
    let last_login=timetoShow(dayFinder(chats[index][10]));
    let first_contact=timetoShow(dayFinder(chats[index][11]));
    $(".user-info-name").html(fullname);
    $("#infoName").html(fullname);
    $("#infoUsername").html(username);
    $("#dobUser").html(dob);
    $("#firstContact").html(first_contact);
    $("#lastLogin").html(last_login);
    $("#dateJoined").html(date_joined);
    $("#infoModal").modal('toggle');
}

const groupInfoHandler = (index) => {
    let fullname=chats[index][5];
    let dob=chats[index][8];
    dob=dob.substring(8,10)+' - '+dob.substring(5,7)+' - '+dob.substring(0,4)
    $(".user-info-name").html(fullname);
    $("#groupInfoName").html(fullname);
    $("#groupCreated").html(dob);
    $("#groupDesc").html(chats[index][10]);
    $("#groupadmin").html(chats[index][11]);
    $("#grouppart").html('');
    $("#grouppart").css('padding-left',"20px");
    for(var j=0;j<chats[index][9].length;j++){
        $("#grouppart").append('<div>'+chats[index][9][j]+'</div>');
    }
    $("#groupInfoModal").modal('toggle');
}