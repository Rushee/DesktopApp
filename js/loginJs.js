
function ajaxStudentLoginCall() {  
    var userName = jQ3('.studentId').val();
    var userPassword = jQ3('.studentPassword').val();
	if(userName == "" || userPassword ==""){
		alert("Enter all fields");
	}
	else{
		jQ3(".logloader").show();
	    checkForUser(userName, userPassword);
	}
}

function checkForUser(userName, userPassword) { 
	jQ3.ajax({
		type: 'post',
		url: studentLogin,
        dataType: 'json',
        data: { studentName: userName, studentPassword: userPassword },
        success: function (data) {
            if (data != null) {
                studentLoginData = data;
                //air.Introspector.Console.log("1");
                //air.Introspector.Console.log(studentLoginData);
				checkForInternetForFirstLogin("1");      
            }
            else {
                jQ3('.studentPassword').val("");
                jQ3('.studentId').val("");
                alert("Not valid user!!!!");
            }
			
        }
    });
}

var file = null;
var image = null;
var imageForParticularUser = "";

function toPNG(orig) {
    return orig.name.substr(0, orig.name.length - orig.extension.length) + 'png';
}

function doBrowse(clickedUser) {
    imageForParticularUser = clickedUser;
    var filters = new runtime.Array(new air.FileFilter('Images', '*.jpg'));
    file.browseForOpen('Select an Image', filters);
}

function doComplete() {
    var bmp = new air.BitmapData(image.width * 0.25, image.height * 0.25);
    var temp = air.File.createTempFile();
    var desktop = null;
    var matrix = new air.Matrix();
    var png = null;
    var stream = new air.FileStream();
    var div = null;
    var elem = null;

    matrix.scale(0.25, 0.25);
    bmp.draw(image.content, matrix);

    png = runtime.com.adobe.images.PNGEncoder.encode(bmp);

    stream.open(temp, air.FileMode.WRITE);
    stream.writeBytes(png, 0, 0);
    stream.close();

    desktop = air.File.applicationStorageDirectory.resolvePath(toPNG(file));
    temp.moveTo(desktop, true);

    jQ3("." + imageForParticularUser + "").attr('src', desktop.url);
    doUpdateProfilePicture(imageForParticularUser, desktop.url);
}

function doSelect() {
    image.load(new air.URLRequest(file.url));
}

function imageUpload() {
    image = new air.Loader();
    image.contentLoaderInfo.addEventListener(air.Event.COMPLETE, doComplete);
    file = air.File.applicationDirectory;
    file.addEventListener(air.Event.SELECT, doSelect);
}

function sendSmsForpasswordReset(){
	var userName = "";
	var userOldPAssword = "";
    var userNewPassword = "";
    jQ3.ajax({
        type: 'post',
        url: "http://sms.ssdindia.com/api/sendhttp.php?authkey=YourAuthKey&mobiles=9999999999,919999999999&message=message&sender=senderid&route=1",
        dataType: 'json',
        success: function (data) {
          alert('Password Changed');
        }
    });
}

function passwordReset(){
	alert('12');
	var userId = "5";
	var userName = "David";
	var userOldPAssword = "David";
    var userPassword = "daavid";
    jQ3.ajax({
        type: 'post',
        url: changePassword,
        dataType: 'json',
		data: { Id: userId, studentName: userName, studentPassword: userPassword, userOldPAssword: userOldPAssword },
        success: function (data) {
          alert('Password Changed');
        }
    });
}

function sendSmsForWelcomeMsg(){
	var userName = "";
    jQ3.ajax({
        type: 'post',
        url: "http://sms.ssdindia.com/api/sendhttp.php?authkey=YourAuthKey&mobiles=9999999999,919999999999&message=message&sender=senderid&route=1",
        dataType: 'json',
        success: function (data) {
          alert('WelCome');
        }
    });
}

function checkForTheSyncDate(syncDateDiffrent){
	//air.Introspector.Console.log("ajax"+syncDateDiffrent);
	if(syncDateDiffrent > 21){
		jQ3.ajax({
        type: 'post',
        url: "http://sms.ssdindia.com/api/sendhttp.php?authkey=YourAuthKey&mobiles=9999999999,919999999999&message=message&sender=senderid&route=1",
        dataType: 'json',
        success: function (data){
          alert('SMS send For Sync notification Sns');
        }
    });
	}
}