var options = '';

for(var i=0;i<users.length;i++){
    if(users[i][0]===username) {
        continue;
    }
    options += '<option value="' +users[i][0] + '"/>';
}

$("#list-users").append(options);

$(document).on('keyup', '.search-res', () =>{
    options = $('datalist')[0].options;
    var val = $("#search").val();
    for (i=0;i<options.length;i++){
       if (options[i].value.toLowerCase() === val.toLowerCase()) {
          $(".add-user").css({"background-color" : "#007bff", "color" : '#fff',"cursor":"pointer !important"});
          break;
       }
       else {
        $(".add-user").css({"background-color" : "#e8e8e8", "color" : 'rgba(0, 0, 0, 0.5)',"cursor":"not-allowed !important"});
       }
    }
});

const createGroup = () => {
    let name=$(".groupname").val().trim();
    $(".groupname").val(name);
    let len=$(".hold-participants .selected").length;
    if(name!=''&&len>0){
        $(".create-btn").css({"background-color" : "#007bff", "color" : '#fff',"cursor":"pointer"});
    }
    else{
        $(".create-btn").css({"background-color" : "#e8e8e8", "color" : 'rgba(0, 0, 0, 0.5)',"cursor":"not-allowed"});
    }
}

var addedparticipants = [];
function remove(e){
    var elem = $($(e).siblings()[0]).text();
    for(i = 0; i < addedparticipants.length; i++){
        if(addedparticipants[i] == elem){
            addedparticipants.splice(i, 1);
            break;
        }
    }
    $($("datalist")[0]).append('<option value="'+elem+'"></option>')
    $(e).parent().detach();
    createGroup();
}

const participantAdder = (user) => {
    return '<div class="selected d-flex">'+
                '<div class="delicon text-center" onclick="remove(this)">'+
                    '<i class="material-icons">clear</i>'+
                '</div>'+
                '<span class="selected-name">'+user+'</span>'+
            '</div>';
}

const requestHandler = (el) => {
    if($(el).css("background-color")!="rgb(0, 123, 255)"){
        return;
    }
    const friend=$(".search-res").val();
    let matchedFilter=$('#list-users option').filter(function() {
        return this.value == friend;
    });
    matchedFilter.detach();
    addedparticipants.push(friend);
    $(".hold-participants").append(participantAdder(friend));
    $('.search-res').val('');
    $(".add-user").css({"background-color" : "#e8e8e8", "color" : 'rgba(0, 0, 0, 0.5)',"cursor":"not-allowed"});
    createGroup();
}

$('.create-btn').click(function(){
    let name=$(".groupname").val();
    let desc=$(".description").val();
    if(desc.trim()=='') desc='-';
    $.ajax({
        type : 'GET',
        url : '/group/create/',
        data : {'participants[]' : addedparticipants,'name':name,'description':desc},
        success :  function(response){
            if(response['error']==false){
                window.location.pathname = '/chat/'
            }
            else{
                $(".error-msg").html(response['message']);
            }
        },
        error : function(response){
            console.log("something bad");
        }
    });
});