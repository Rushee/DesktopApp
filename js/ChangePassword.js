var oldPass = "";
var newPass = "";
var confirmPass = "";
function ajaxChangePassCall(){
	var email =  jQ3('.Email').val();
	oldPass =  jQ3('.studentOldPassword').val();
	newPass =  jQ3('.studentNewPassword').val();
	confirmPass =  jQ3('.studentConfirmPassword').val();
	
	if(email == "" || oldPass == "" || newPass=="" || confirmPass==""){
		alert("Enter All Fields");
	}
	else{
		jQ3.ajax({
			type: 'post',
		    //url: "http://desktopweb.thinkforce18.com/api/StudentLogin/changePassword/",
		    //url: "http://localhost:5436/api/StudentLogin/changePassword/",
			url: changePassword,
			dataType: 'json',
			data: {
				Email: email,
				studentPassword: newPass
			},
			success: function(data){
				if (data) {
					var temp = callForChangePass();	
					 
					//air.Introspector.Console.log(temp);
					if(temp){
						alert("Password changed");
				        window.location.assign("Login.html");
					}
					
					alert("Password changed");
				    window.location.assign("Login.html");			
				}
				else {
					alert("Invalid Email Id");
					jQ3('.Email').val("");
					jQ3('.studentOldPassword').val("");
					jQ3('.studentNewPassword').val("");
					jQ3('.studentConfirmPassword').val("");
				}
			}
		});
	}
	
}

function callForChangePass()
{
	//air.Introspector.Console.log("Second IN");
	//air.Introspector.Console.log(accessToken);
	jQ3.ajax({
		beforeSend: function(xhr){
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		},
		type: 'post',
		//url: "http://desktopweb.thinkforce18.com/api/Account/ChangePassword",
		url: "http://localhost:5436/api/Account/ChangePassword",
		dataType: 'json',
		data: {
			"OldPassword": oldPass,
			"NewPassword": newPass,
			"ConfirmPassword": confirmPass
		},
		success: function(data){
		//	air.Introspector.Console.log("Second Change");
		//	air.Introspector.Console.log(data);
			if (data) {
				alert("Password changed");
				window.location.assign("Login.html");
			}
			else {
				alert("Invalid Email Id");
				jQ3('.Email').val("");
				jQ3('.studentOldPassword').val("");
				jQ3('.studentNewPassword').val("");
				jQ3('.studentConfirmPassword').val("");
			}
		}
	});
	return true;
}

function backToHomePageCall(){
	window.location.assign("Login.html");
}
