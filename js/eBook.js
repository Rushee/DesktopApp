var globalVar;
var str = "";
function getTextHighlight(colour){
    var range, sel;
    if (window.getSelection) {
        // IE9 and non-IE
        try {
            if (!document.execCommand("BackColor", false, colour)) {
                makeEditableAndHighlight(colour);
            }
        }
        catch (ex) {
            makeEditableAndHighlight(colour)
        }
    }
    else 
        if (document.selection && document.selection.createRange) {
            // IE <= 8 case
            range = document.selection.createRange();
            range.execCommand("BackColor", false, colour);
        }
}

function makeEditableAndHighlight(colour){
    var range, sel = window.getSelection();
    highlightData(sel);
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
    }
    document.designMode = "on";
    if (range) {
        sel.removeAllRanges();
        sel.addRange(range);
    }
    // Use HiliteColor since some browsers apply BackColor to the whole block
    if (!document.execCommand("HiliteColor", false, colour)) {
        document.execCommand("BackColor", false, colour);
    }
    document.designMode = "off";
}

function highlightData(sel){
    parent.callFromHightLight(sel);
}

function saveImageData(sbj,chname,obj){
    var imageName = obj.attr('name');
    var className = obj.attr('class');
    globalVar = obj.attr('src');
    var Subject = sbj;
	var parentValueSub = sbj;
	var ChapterName = chname;
   // var Topic = obj.parent().parent().find('h3').html();
    //var SubTopic = obj.parent().find('h4').html();
    var Note = globalVar;
	var ChapterNo;
    window.parent.callFromChild(parentValueSub, ChapterName,ChapterNo,'<img src="'+Note+'"/>');
    alert("Save note successfully!!!!");
}

function callIframe(id){
    // alert(id);
}

function getChapterFromDropdown(clickedSubject){
    clikedSubToNote = clickedSubject;
    // air.Introspector.Console.log(clikedSubToNote);
    $(".btnChapter").remove();
    $(".subjectList").hide();
    $("#subjectName").show();
    $('.noteHeading').removeClass('btnHide');
    $("#subjectName").text(clickedSubject);
    $(".backToSelectChapter").show();
    $(".animationLink").css("display", "block");
    for (var i = 0; i < chapterForParticularSubject.length; i++) {
        //air.Introspector.Console.log($('#subject').attr('data-val'));
        if (clickedSubject == chapterForParticularSubject[i].Subject) {
            //air.Introspector.Console.log("subject "+chapterForParticularSubject[i].Subject);
            $('.chaptertList').append("<input type='button' id='" + chapterForParticularSubject[i].id + "' class='btnChapter' name='Submit' value=" + chapterForParticularSubject[i].Chapter + " style='margin: 15px 5px 0;'></input>");
        }
    }
    for (var i = 0; i < notesForParicularSubject.length; i++) {
        if (clickedSubject == notesForParicularSubject[i].Subject) {
            //air.Introspector.Console.log(notesForParicularSubject[i]);
            $('.notesList').append("<input type='button' id='" + notesForParicularSubject[i].id + "' class='btnNotes' name='Submit' value=" + notesForParicularSubject[i].ChapterNo + " style='margin: 15px 5px 0;'></input>");
        }
    }
    $('.backToSelectChapter').removeClass('hideBackBtn');
}

function subjectList(subjectChapterFromDb){
    if (subjectChapterFromDb) {
        for (var i = 0; i < subjectChapterFromDb.length; i++) {
            if (i == 0) {
                str += '<a href="javascript:void(0);" style="text-decoration: none; margin-left:0px;"  onclick="getChapter(\'' + subjectChapterFromDb[i].Subject + '\')"><span  id="subject" style="margin-top:82px;position:absolute;margin-left:35px; color:white;font-size:23px; color:white" data-val=' + subjectChapterFromDb[i].Subject + '>' + subjectChapterFromDb[i].Subject + '</span>';
                str += "<img src='assets/images/book_blue.png' alt='books'></img></a>";
                $('.subjectList').append(str);
                str = "";
            }
            else {
                str += '<a href="javascript:void(0);" style="text-decoration: none; margin-left:20px;"  onclick="getChapter(\'' + subjectChapterFromDb[i].Subject + '\')"><span  id="subject" style="margin-top:82px;position:absolute;margin-left:30px; color:white;font-size:23px" data-val=' + subjectChapterFromDb[i].Subject + '>' + subjectChapterFromDb[i].Subject + '</span>';
                str += "<img src='assets/images/book_blue.png' alt='books'></img></a>";
                $('.subjectList').append(str);
                str = "";
            }
        }
    }
}

function getChapter(clickedSubject){
    $(".hiddenFieldSub").text(clickedSubject);
    getChapterFromDropdown(clickedSubject);
}

function showIframe(pdf){
    var myframe;
    var HTMLstr = "";
    var testHTML = pdf; //pdf[0].HtmlText;
    var pCount = 0;
    var H3Count = 0;
    var $html = $(testHTML);
    for (var i = 0; i < $html.length; i++) {

        if ($html[i].tagName == "P") {
            pCount = pCount + 1;
            $html[i].id = "p" + pCount;
        }
        if ($html[i].tagName == "H3") {
            H3Count = H3Count + 1;
            $html[i].id = "h3" + H3Count;
        }
    }

    for (var j = 0; j < $html.length; j++) {
        HTMLstr += $html[j].outerHTML;
    }
    myframe = $('#pdfiframe').contents().find('.page1');
    myframe.empty();
    myframe.html($html);
    $('#pdfiframe').removeClass('iframeHide');
    pdf = "";
}

jQ3(".btnChapter").live("click", function(){
    $("#subjectName").hide();
    $('.backToSelectChapter').hide();
    $('.lang-switcher').addClass('dropDownHide');
    $('.btnChapter').addClass('btnHide');
    $('.noteHeading').addClass('btnHide');
    $('.btnBackToSubject').show();
    //air.Introspector.Console.log($(this).attr("value"));
    clikedChapterNo = $(this).attr("value");
    $(".hiddenFieldChap").text(clikedChapterNo);
    showAnimationLinks(clikedSubToNote, clikedChapterNo);
    showIframeWithParticularChapter($(this).attr("id"));
});

function showAnimationLinks(sub, chapNo) {
    var links = doGetAnimationLinks(sub, chapNo);
    if (links) {
        var strLink = ""
        for (var i = 0; i < links.length ; i++) {
            strLink += "<a class='animationLink' id='" + links[i].FileName + "' href='javascript:void(0)' return false;' style='float:right; padding-right:50px;'>" + links[i].NameToDisplay + "</a>";
        }
        $(".animationLinks").append(strLink);
    }
    
}

jQ3(".animationLink").live("click", function () {
    openExternalURL("http://sunaarise.com/video/login.html?animation=" + this.id)
});

jQ3(".btnNotes").live("click", function(){
    $("#subjectName").hide();
    $('.backToSelectChapter').hide();
    $('.lang-switcher').addClass('dropDownHide');
    $('.btnChapter').addClass('btnHide');
    $('.btnNotes').addClass('btnHide');
    $('.noteHeading').addClass('btnHide');
    $('.backToSelectSubjectFromNotes').removeClass('btnHide');
    $('.btnBackToSubject').show();
    
    //air.Introspector.Console.log($(this).attr("value"));
    var chapterNo = $(this).attr("value");
    // air.Introspector.Console.log(chapterNo);
    var notesData = getTheNotesFromDb(chapterNo);
    // air.Introspector.Console.log(notesData);
    var str = "";
    str = "<h1>" + notesData[0].ChapterName + "</h1>";
    $('.showNotes').append(str);
    for (var i = 0; i < notesData.length; i++) {
        jQ3('.showNotes').append('<div id="main-div" class="main-div-delete-' + notesData[i].id + '"><div class="allNotes" id="main-div"><p id="noteId_' + notesData[i].id + '" class="note' + i + '">' + notesData[i].Note + '</p></div><div id="main-div' + i + '"></div><button id="callEditor" class="btnEdit_' + i + '" style="width:150px; float: left;">EDIT</button><button id="callSaveEditor" class="btnSave_' + i + ' hideBtn" style="width:150px; float: left; margin-left:10px;">Save</button><button id="callDeleteEditor" class="btnDelete_' + i + '" style="width:150px; float: left; margin-left:10px;">Delete</button></div>');
        //$(".btnEdit" + i + "").setAttribue('onclick', callEditor(i));
    }
    //jQ3('.showNotes').append('<div id="main-div" class="main-div-delete-"><div class="allNotes" id="main-div"><p id="noteId_" class="note">' + tmp + '</p></div><div id="main-div"></div><button id="callEditor" class="btnEdit_' + i + '" style="width:150px; float: left;">EDIT</button><button id="callSaveEditor" class="btnSave_' + i + ' hideBtn" style="width:150px; float: left; margin-left:10px;">Save</button><button id="callDeleteEditor" class="btnDelete_' + i + '" style="width:150px; float: left; margin-left:10px;">Delete</button></div>');
    
    //callEditor(0);

    //$('.showNotes').append("<div id='main-div'><div class='allNotes' id='main-div'><h1>" + notesData[0].ChapterName + "</h1><h2>" + notesData[0].Topic + "</h2><h3>" + notesData[0].SubTopic + "</h3><p>" + notesData[0].Note + "</p></div></div>");
});
var checkCountOfNote = "";
jQ3("#callEditor").live("click", function(){

    var count = $(this).attr("class");
    count = count.split("_");
    
    var editorName = '.editor' + count[1] + '';
    $(this).prop('disabled', true);
    var editorName = document.createElement('span');
    editorName.className = "status";
    editorName.id = "span_status" + count[1];
    
    var textEditor = $(".note" + count[1] + "").html();
    
    $("#main-div" + count[1] + "").append(editorName);
    $(".btnSave_" + count[1] + "").removeClass("hideBtn");
    $(editorName).jqte();
    //air.Introspector.Console.log($("#main-div" + count[1] + "").find(".jqte_editor"));
    $("#main-div" + count[1] + "").find(".jqte_editor").html(textEditor);
    
});


jQ3("#callSaveEditor").live("click", function(){
    var count = $(this).attr("class");
    count = count.split("_");
    // alert($("#main-div" + count[1] + "").find(".jqte_editor").html());
    //  alert($(".note" + count[1] + "").attr("id"));
    var noteId = $(".note" + count[1] + "").attr("id").split("_");
    $(".note" + count[1] + "").html($("#main-div" + count[1] + "").find(".jqte_editor").html());
    
    updateNotes(noteId[1], $("#main-div" + count[1] + "").find(".jqte_editor").html());
    $(".btnSave_" + count[1] + "").addClass("hideBtn");
    $("#main-div" + count[1] + "").html("");
    $(".btnEdit_" + count[1] + "").removeAttr("disabled");
});

jQ3("#callDeleteEditor").live("click", function () {

    var retVal = confirm("Do you want to Delete Notes ?");
    if (retVal == true) {
        var count = $(this).attr("class");
        count = count.split("_");
        // alert($("#main-div" + count[1] + "").find(".jqte_editor").html());
        //  alert($(".note" + count[1] + "").attr("id"));
        var noteId = $(".note" + count[1] + "").attr("id").split("_");
        $(".main-div-delete-" + noteId[1] + "").remove();

        deleteNote(noteId[1]);
        //  $(".btnSave_" + count[1] + "").addClass("hideBtn");
        //  $("#main-div" + count[1] + "").html("");
        //  $(".btnEdit_" + count[1] + "").removeAttr("disabled");
        return true;
    } else {
        
        return false;
    }

   
});

function backToSelectSubject(){
    $('#pdfiframe').addClass('iframeHide');
    $(".notesList").html("");
    getChapterFromDropdown(clikedSubToNote);
    $('.showNotes').html("");
    $("#subjectName").show();
    $('.backToSelectChapter').removeClass('hideBackBtn');
    $('.backToSelectSubjectFromNotes').removeClass('btnHide');
    $('.lang-switcher').removeClass('dropDownHide');
    $('.btnChapter').removeClass('btnHide');
    $('.noteHeading').removeClass('btnHide');
    $('.btnNotes').removeClass('btnHide');
    $('.btnBackToSubject').addClass('btnHide');
    var myframe;
    myframe = $('#pdfiframe').contents().find('.main-container');
    myframe.remove();
}

function backToSelectChapter(){
	 
	$(".animationLink").css("display","none");
    $('.showNotes').html("");
    $('.btnChapter').addClass('btnHide');
    $('.btnNotes').addClass('btnHide');
    $('.noteHeading').addClass('btnHide');
    $('.backToSelectChapter').addClass('hideBackBtn');
    $('.btnBackToSubject').addClass('btnHide');
    $(".subjectList").show();
    $("#subjectName").hide();
    $('.backToSelectChapter').hide();
}

function backToSelectSubjectFromNotes(){
	 
	$(".notesList").html("");
	notesForParicularSubject = "";
	notesForParicularSubject = doShowNotesFroParticularSub();
	if (hasNotes(clikedSubToNote)) {
		getChapterFromDropdown(clikedSubToNote);
	}
    $('.showNotes').html("");
    $("#subjectName").show();
    $('.backToSelectChapter').show();
    $('#pdfiframe').addClass('iframeHide');
    $('.lang-switcher').removeClass('dropDownHide');
    $('.btnChapter').removeClass('btnHide');
    $('.noteHeading').removeClass('btnHide');
    $('.btnNotes').removeClass('btnHide');
    $('.backToSelectSubjectFromNotes').addClass('btnHide');
    $('.btnBackToSubject').hide();
    $(".animationLink").html("");
}
