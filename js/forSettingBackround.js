function loadBackground(){
	var file = air.File.applicationStorageDirectory.resolvePath(""+getBackgroundImage());
	if(file.exists)
	jQ3(".class-for-right-click-menu").attr('src',""+getBackgroundImage());
	else
	jQ3(".class-for-right-click-menu").attr('src',"assets/images/back.jpg");
}
function setBackground(){
	var filters = null,file = null;
	file = air.File.applicationDirectory;
	filters = new runtime.Array(new air.FileFilter('Images', '*.jpg'));
	file.browseForOpen("Select an image for background", filters);
	file.addEventListener(air.Event.SELECT, function(){
	    jQ3(".class-for-right-click-menu").attr('src',""+file.url);
		doCreateBackgroundImage();
		doUpdateBackgroundImage(file.url);
	});
}