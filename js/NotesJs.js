var str="";

function assignSubjectToDropDown(subjectNotesFromDb){
 	for(var i=0;i<subjectNotesFromDb.length;i++){
		str+='<a href="javascript:void(0);" style="text-decoration:none;margin-left:10px;" onclick="getSubjectNote(\''+subjectNotesFromDb[i].Subject+'\');"><span style="margin-top:82px;position:absolute;margin-left:55px; color:white;font-size:26px; color:white" id="notedetails">'+subjectNotesFromDb[i].Subject+'</span>';
		str+='<img src="assets/images/book_orange.png" alt="notes"></img></a>';
		$('.subjectList').append(str);
		str="";
	}	
 
}

function showNotesFromDropdown(clickedSubject){
	$(".btnChapter").remove();
	$('.allNotes').remove();
	$('.btnBackToSubject').removeClass('btnHide');
	$('.subjectList').addClass('dropdownHide');
	$('.showNotes').removeClass('showNotesHide');
	notesForParicularSubject = getAllNotesOfPerticularSubject(clickedSubject);
	len = getNumberOfNotesForPerticularSubject(clickedSubject);
	for (var i = 0; i < len; i++) {	
		if (clickedSubject == notesForParicularSubject[i].Subject) {	 
			$('.showNotes').append("<div class='allNotes' id='main-div'><h1>" + notesForParicularSubject[i].ChapterName + "</h1><p>" + notesForParicularSubject[i].Note + "</p></div>");
			alert(notesForParicularSubject[i].Note);
		}
	}
}

function backToSelectSubject(){
	$('.btnBackToSubject').addClass('btnHide');
	$('.showNotes').addClass('showNotesHide');	
	$('.subjectList').removeClass('dropdownHide');
}
function getSubjectNote(clickedSubject)
{
showNotesFromDropdown(clickedSubject);
}
