function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateUsername(username){
    var patt1 = /[^a-zA-Z0-9-+_.@]/gi; 
    var result = username.match(patt1);
    if(result == null){
        return true;
    }
    return false;
}

function validatePassword(password){
    password=password.trim();
    if(password.length<8) return false;
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
    if(id!='email') validateLength(el);
}

const validateLength = (el) => {
    let id=el.id;
    let val=$("#"+id).val();
    val=val.trim();
    let len=4;
    let name='Username';
    if(id=='password') {
        len=8;
        name='Password';
    }
    if(val.length<len) {
        setError(id,name+' must contain atleast '+len.toString()+' characters',1);
        return false;
    }
    return true;
}

const setError = (id,message,opacity) => {
    let element=$("#error-"+id);
    if(opacity==1){
        element.html(message);
    }
    element.css("opacity",opacity.toString());
}

const keyUpHandler = (el) => {
    let id=el.id;
    let element=$("#"+id);
    let valid=false;
    let val=element.val().trim();
    element.val(val);
    if(id=='username') valid=validateUsername(val);
    if(id=='email') valid=validateEmail(val);
    if(valid==false&&id!='password'){
        if(id=='username')
            setError(id,'Username is invalid',1);
        else setError(id,'Email format is incorrect.',1);
    }
    else {
        setError(id,'',0);
    }
}

$("#signInForm").submit(function(e){
    let username=$("#username").val();
    var elem=$(".error-msg");
    if(validateUsername(username)==false){
        e.preventDefault();
        elem.html("Kindly fill out the details properly.");
        return;
    }
    if(validateLength(document.getElementById('username'))==false || validateLength(document.getElementById('password')) == false){
        e.preventDefault();
        elem.html("Kindly fill out the details properly.")
    }
});

$("#signUpForm").submit(function(e){
    let username=$("#username").val();
    let elem=$(".error-msg");
    let email=$("#email").val();
    if(validateUsername(username)==false || validateEmail(email)==false){
        e.preventDefault();
        elem.html("Kindly fill out the details properly.");
        return;
    }
    if(validateLength(document.getElementById('username'))==false || validateLength(document.getElementById('password')) == false){
        e.preventDefault();
        elem.html("Kindly fill out the details properly.")
    }
});