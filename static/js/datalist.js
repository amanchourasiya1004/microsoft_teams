var options = '';

for(var i=0;i<users.length;i++){
    if(users[i][0]===username) {
        continue;
    }
    options += '<option value="' +users[i][0] + '" data-name="'+users[i][1]+'" data-back="'+users[i][2]+'" data-font="'+users[i][3]+'" data-dob="'+users[i][4]+'" data-joined="'+users[i][5]+'" data-login="'+users[i][6]+'"/>';
}

$("#list-users").append(options);

const clickhandler = (el) => {
    $(".iconwrap").css("background","#fff");
}

const searchblurhandler = (el) => {
    const val=$(el).val();
    if(val===''){
        $(".iconwrap").css("background","rgba(255,255,255,.8)");
    }
}

$(document).on('keyup', '.search-res', () =>{
    options = $('datalist')[0].options;
    var val = $("#search").val();
    for (i=0;i<options.length;i++){
       if (options[i].value.toLowerCase() === val.toLowerCase()) {
          $(".start-conversation").css({"background-color" : "#007bff", "color" : '#fff',"cursor":"pointer"});
          break;
       }
       else {
        $(".start-conversation").css({"background-color" : "#e8e8e8", "color" : 'rgba(0, 0, 0, 0.5)',"cursor":"not-allowed"});
       }
    }
});