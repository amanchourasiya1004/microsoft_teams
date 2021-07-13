const isEmpty = (el) => {
    let id=el.id;
    let val=$("#"+id).val();
    if(val.trim()=='') {
        $("#error-"+id).css("opacity","1");
        return false;
    }
    return true;
}

const clickHandler = (el) => {
    let id=el.id;
    $("#"+id).css("box-shadow","0 1.5px 0 0 #4b53bc");
}

const onBlurHandler = (el) => {
    let id=el.id;
    let element=$("#"+id);
    if(element.val()==''){
        element.css("box-shadow","0 2px 0 0 #e5e5e5");
    }
}

const keyUpHandler = (el) => {
    let id=el.id;
    $("#error-"+id).css("opacity","0");
}

$("#extradetails").submit(function(e){
    let valid=isEmpty(document.getElementById('firstname'));
    valid=valid&&isEmpty(document.getElementById('lastname'));
    valid=valid&&isEmpty(document.getElementById('date'));
    if(valid==false){
        e.preventDefault();
        $(".error-msg").html("Kindly fill out the details properly");
    }
});