function ajaxForgetPassCall(){
	var email =  jQ3('.Email').val();
	jQ3.ajax({
        type: 'post',
        url: forgotPass,
        dataType: 'json',
        data: { Email: email },
        success: function (data) {
			if(data){
				alert("Password send to the Email Id");
				window.location.assign("Login.html");
			}
			else{
				alert("Invalid Email Id");
				jQ3('.Email').val("");
			}
        }
    });
}

function backToHomePageCall(){
	window.location.assign("Login.html");
}
