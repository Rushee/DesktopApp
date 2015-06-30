

//air.Introspector.Console.log(data);

var globalVal = -1, dropdownvalue;
var next = 0;
var jsonDataFromAjax = [];
var noOfQuestionsFromAjax = [];
var randomTenQuestions = [];
var countId = 0;
var countNoOfQuestion = 1;
var chapterDataFromAjax = [];
var subjectName = "";
var chapterNo = "";
//----------------------------------------------AJAX CALL--------------------------------------
function ajaxCall() {
    doCheckForLastTest(globalUserId, subjectName, globalStudentStandard, chapterNo);
    countId = 0;
    jsonDataFromAjax = [];
    noOfQuestionsFromAjax = [];
    var randomQuestion = [];
    var count = 0;
    randomTenQuestions = [];
    jQ3('#loaderImage').fadeIn('slow');
    var t = setTimeout(function () {
        jQ3.ajax({
            type: 'post',
            url: questions,
            dataType: 'json',
            data: { Text: subjectName, Standard: globalStudentStandard, Chapter: chapterNo },
            success: function (data) {
                jQ3('#loaderImage').fadeOut('slow');
                jQ3('#question-wrap').html(" ");
                globalVal++;
                var str;
                testMark = 0;
                countNoOfQuestion = 1;
                jsonDataFromAjax.push(data);
				//air.Introspector.Console.log(data);
                //------------------------Random 10 question----------------------
                var totalQuestionsFromDb = jsonDataFromAjax[0].Question;
                for (var j = 0; j < jsonDataFromAjax[0].Question.length; j++) {
                    noOfQuestionsFromAjax.push(j);
                }

                function random() {
                    if (count != 10) {
                        randomQuestion.push(noOfQuestionsFromAjax.splice(Math.floor(Math.random() * noOfQuestionsFromAjax.length), 1));
                        count++;
                        random();
                    }
                }
                random();

                var selectDataFromRandomeData = 0;
                for (var t = 0; t < randomQuestion.length; t++) {
                    selectDataFromRandomeData = randomQuestion[t];
					
                    randomTenQuestions.push(totalQuestionsFromDb[selectDataFromRandomeData]);
                }
                //------------------------End Random 10 question----------------------
                nextQuestion();
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                alert(err.Message);
            }
        });

    }, 4000);
}

//----------------------------------------------END AJAX CALL--------------------------------------

//------------------------------------------ Ajax for Grid ---------------------------------------
function ajaxCallForSubjectChapter() {
    chapterDataFromAjax = [];
    var studSubject = subjectName;
    var studStandard = globalStudentStandard;
    jQ10('#gridLoaderImage').removeClass('gridLoader');
    jQ3('#gridLoaderImage').fadeIn('slow');
    var temp = setTimeout(function () {
        jQ3.ajax({
            //url: "http://desktopweb.thinkforce18.com/api/Question/Post/",
		   //url: "http://webapi.sonorousiq.com/api/Question/Post/",
            url: questionsPost,
            type: 'post',
            dataType: 'json',
            data: { Text: studSubject, Standard: studStandard },
            success: function (data) {
                jQ3('#gridLoaderImage').fadeOut('slow');
                if (data.length != "0") {
                    chapterDataFromAjax = data;
                    getGridViewDisplay(chapterDataFromAjax);
                }
                else {
                    alert("No test present for this subject");
                }
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                alert(err.Message);
            }
        });
    }, 4000);
}
//---------------------------- Ajax for Grid --------------------------------
//-----------------------------GRID TO SHOW----------------------------------
function getGridViewDisplay(chapterDataFromAjax) {
    jQ10('.tHead').html(' ');
    jQ3('#main-div').addClass('main-divDisplay');
    for (var i = 0; i < (chapterDataFromAjax.length) ; i++) {
        var checkForReTest = doCheckForReTest(globalUserId, chapterDataFromAjax[i].Chapter, subjectName, globalStudentStandard);
        
        if (checkForReTest == 0) {
            jQ3('.tHead').append('<tr><td>' + chapterDataFromAjax[i].Chapter + '</td><td><a class="giveTest" id=' + chapterDataFromAjax[i].Chapter + ' href="#" style="color:#ED0C1B;" cursor:pointer;>Start Test</a></td><td><a class="reviewTest" id=' + chapterDataFromAjax[i].Chapter + ' href="#" style="color:#078C2B;" cursor:pointer;>Review Test</a></td></tr>');
        }
        else {
            jQ3('.tHead').append('<tr><td>' + chapterDataFromAjax[i].Chapter + '</td><td><a class="giveTest" id=' + chapterDataFromAjax[i].Chapter + ' href="#" style="color:#ED0C1B;" cursor:pointer;>Re-Test</a></td><td><a class="reviewTest" id=' + chapterDataFromAjax[i].Chapter + ' href="#" style="color:#078C2B;" cursor:pointer;>Review Test</a></td></tr>');
        }
    }
    jQ3('.gridview-wrap').show();
}

jQ10(document).on("click", ".giveTest", function (e) {
    chapterNo = jQ10(this).attr('id');
    ajaxCall();

    jQ10('.gridview-wrap').hide();
    jQ3('#main-div').removeClass('main-divDisplay');

    jQ10('.wrapper').children('.lang-switcher').children('#dropdown').attr('disabled', 'disabled');

    jQ10(".home").attr("disabled", "disabled");
    jQ10(".timetable").attr("disabled", "disabled");
    jQ10(".onlinetest").attr("disabled", "disabled");
    jQ10(".query").attr("disabled", "disabled");
    jQ10(".ebook").attr("disabled", "disabled");

    jQ10('.home').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.timetable').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.onlinetest').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.query').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.ebook').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
});

jQ10(document).on("click", ".reviewTest", function (e) {
    chapterNo = jQ10(this).attr('id');
    doShowReviewTestSummary(globalUserId, chapterNo, subjectName, globalStudentStandard);
});

jQ10(document).on("click", ".reTest", function (e) {
    jQ3('.reTest').remove();
    jQ3('.question-wrap').html(" ");
    jQ10('.wrapper').children('.lang-switcher').children('#dropdown').attr('disabled', 'disabled');
    jQ10(".home").attr("disabled", "disabled");
    jQ10(".timetable").attr("disabled", "disabled");
    jQ10(".onlinetest").attr("disabled", "disabled");
    jQ10(".query").attr("disabled", "disabled");
    jQ10(".ebook").attr("disabled", "disabled");

    jQ10('.home').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.timetable').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.onlinetest').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.query').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    jQ10('.ebook').click(function (e) {
        if (jQ10(".timetable").attr("disabled") == "disabled") {
            e.preventDefault();
        }
    });
    ajaxCall();



});
//-----------------------------END GRID TO SHOW--------------------------------

//----------------------------------ON CHANGE DROP DOWN FUNCTION------------------------------
function getvalueDropdown() {
    jQ3('.reTest').remove();
    subjectName = "";
    chapterNo = "";
    jQ3('.sidebar-nav').unbind("click");
    dropdownvalue = jQ3('#dropdown').val();
    jQ3('.question-wrap').html(" ");

    if (dropdownvalue == 'SelectTheSubject') {
        subjectName = '';
        jQ10('.gridview-wrap').hide();
        jQ3('#main-div').addClass('main-divDisplay');
    }
    else {
        subjectName = dropdownvalue;
            ajaxCallForSubjectChapter();
    }
    //if (dropdownvalue == 'Maths') {
    //    subjectName = 'Maths';
    //    ajaxCallForSubjectChapter();
    //}
    //if (dropdownvalue == 'English') {
    //    subjectName = 'English';
    //    ajaxCallForSubjectChapter();
    //}
}
//----------------------------------END ON CHANGE DROP DOWN FUNCTION------------------------------
var correctAnswer = " ";
var correctAnswerText = " ";
var givenAnswerText = " ";
var testMark = 0;
//-------------------------------Radio Button click check------------------------------
var i=1;
jQ3(".radioNextQuestion").live("click", function () {
    if (!jQ3("input[name='radioName']:checked").val()) {
        alert("Please answer the question");
    }
    else {
        var givenAns = jQ3("input[name='radioName']:checked").val();
	    
		 givenAnswerText=jQ3("input[name='radioName']:checked").attr('data-val'); 
         
        //air.Introspector.Console.log(correctAnswer +"=="+ jQ3("input[name='radioName']:checked").val());
        if (correctAnswer == jQ3("input[name='radioName']:checked").val()) {
            testMark++;
        }
		 
        //givenAnswerText= givenAnswerText.replace(/^[ ]+|[ ]+$/g, '');
		//givenAnswerText = givenAns;
        doAddTempData((countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, givenAns, givenAnswerText);
        doAddReviewData(globalUserId, chapterNo, globalStudentStandard, subjectName, (countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, givenAns,givenAnswerText, testMark);
        nextQuestion();
    }
});
//-------------------------------CheckBox Button click check------------------------------
jQ3(".checkBoxNextQuestion").live("click", function () {
    var checkBoxCheckedData = " ";
	 var checkBoxCheckedDataText = " ";
    if (!jQ3("input[name='checkBoxName']:checked").val()) {
        alert("Please answer the question");
    }
    else {
		
		 jQ3('input[type=checkbox]:checked').each(function () {
            checkBoxCheckedData += jQ3(this).val() + ",";
        });
		
        jQ3('input[type=checkbox]:checked').each(function () {
            checkBoxCheckedDataText += jQ3(this).attr('data-val') + ",";
        });
		 
        checkBoxCheckedData = checkBoxCheckedData.substring(0, checkBoxCheckedData.length - 1);
        checkBoxCheckedData = checkBoxCheckedData.replace(/^[ ]+|[ ]+$/g, '');
	    
	    checkBoxCheckedDataText = checkBoxCheckedDataText.substring(0, checkBoxCheckedDataText.length - 1);
        checkBoxCheckedDataText = checkBoxCheckedDataText.replace(/^[ ]+|[ ]+$/g, '');
		
		//air.Introspector.Console.log("Check2 ==="+checkBoxCheckedDataText);
		 
        if (correctAnswer == checkBoxCheckedData) {
            testMark++;
        }
		 
        doAddTempData((countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, checkBoxCheckedData, checkBoxCheckedDataText);
        doAddReviewData(globalUserId, chapterNo, globalStudentStandard, subjectName, (countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, checkBoxCheckedData,checkBoxCheckedDataText, testMark);
        nextQuestion();
    }
});
//-------------------------------Submit Radio Button------------------------------
jQ3(".radioSubmitQuestion").live("click", function () {

    jQ10('.wrapper').children('.lang-switcher').children('#dropdown').removeAttr('disabled', 'disabled');
    jQ10(".home").removeAttr("disabled", "disabled");
    jQ10(".timetable").removeAttr("disabled", "disabled");
    jQ10(".onlinetest").removeAttr("disabled", "disabled");
    jQ10(".query").removeAttr("disabled", "disabled");
    jQ10(".ebook").removeAttr("disabled", "disabled");


    if (!jQ3("input[name='radioName']:checked").val()) {
        alert("Please answer the question");
    }
    else {
        var givenAns = jQ3("input[name='radioName']:checked").val();
			givenAnswerText=jQ3("input[name='radioName']:checked").attr('data-val');
			
        if (correctAnswer == jQ3("input[name='radioName']:checked").val()) {
            testMark++;
        }
	 
		 
        //givenAnswerText= givenAnswerText.replace(/^[ ]+|[ ]+$/g, '');
        doAddTempData((countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, givenAns,givenAnswerText);
        doAddReviewData(globalUserId, chapterNo, globalStudentStandard, subjectName, (countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, givenAns,givenAnswerText, testMark);
        doAddOverAllPerformance(globalUserId, chapterNo, globalStudentStandard, subjectName, testMark);
        var date = new Date();
        var currDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        alert(date);
        var test = { userId: globalUserId, Chapter: chapterNo, Standard: globalStudentStandard, Subject: subjectName, highestMark: testMark, CurrDate: date }
        air.Introspector.Console.log(test);
        jQ3.ajax({
            type: 'post',
            url: overallPerformance,
            dataType: 'json',
            data: { userId: globalUserId, Chapter: chapterNo, Standard: globalStudentStandard, Subject: subjectName, highestMark: testMark, CurrDate: date },
            success: function (data) {
                
            }
        });
        //------------------------------SCORE------------------------------
       
        jQ3('.question-wrap').html(" ");
        jQ3('.question-wrap').append('<h1 class="totalMarks" style="margin-top:-2%;">You scored ' + testMark + '0%</h1>');
        jQ3('.lang-switcher').append("<div style='margin-top:-10%; margin-right:90%;'><input type='button' name='Re-Test' value='Re-Test' class='reTest retestSave' style='margin-Top:27%; position:absolute; margin-left: -282%;'/></div>");
        doShowTestSummary();
    }
});

//-------------------------------Submit CheckBox Button------------------------------
jQ3(".checkBoxSubmitQuestion").live("click", function () {
    jQ10('.wrapper').children('.lang-switcher').children('#dropdown').removeAttr('disabled', 'disabled');
    jQ10(".home").removeAttr("disabled", "disabled");
    jQ10(".timetable").removeAttr("disabled", "disabled");
    jQ10(".onlinetest").removeAttr("disabled", "disabled");
    jQ10(".query").removeAttr("disabled", "disabled");
    jQ10(".ebook").removeAttr("disabled", "disabled");

    var checkBoxCheckedData = " ";
	var checkBoxCheckedDataText= " ";
    if (!jQ3("input[name='checkBoxName']:checked").val()) {
        alert("Please answer the question");
    }
    else {
        jQ3('input[type=checkbox]:checked').each(function () {
            checkBoxCheckedData += jQ3(this).val(); + ",";
        });
		 jQ3('input[type=checkbox]:checked').each(function () {
            checkBoxCheckedDataText += jQ3(this).attr('data-val') + ",";
        });
		 
       checkBoxCheckedData = checkBoxCheckedData.substring(0, checkBoxCheckedData.length - 1);
       checkBoxCheckedData = checkBoxCheckedData.replace(/^[ ]+|[ ]+$/g, '');
	   
	   checkBoxCheckedDataText = checkBoxCheckedDataText.substring(0, checkBoxCheckedDataText.length - 1);
       checkBoxCheckedDataText = checkBoxCheckedDataText.replace(/^[ ]+|[ ]+$/g, '');
	   
		//checkBoxCheckedDataText=checkBoxCheckedData;
        if (correctAnswer == checkBoxCheckedData) {
            testMark++;
        }
		 /*jQ3('input[type=checkbox]:checked').each(function () {
            checkBoxCheckedDataText += jQ3(this).attr('data-val') + ",";
        });*/
		 
        doAddTempData((countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, checkBoxCheckedData,checkBoxCheckedDataText);
        doAddReviewData(globalUserId, chapterNo, globalStudentStandard, subjectName, (countNoOfQuestion - 1), randomTenQuestions[countId - 1].QuestionText, correctAnswer,correctAnswerText, checkBoxCheckedData,checkBoxCheckedDataText, testMark);
        jQ3('.lang-switcher').append("<div style='margin-top:-10%; margin-right:90%;'><input type='button' name='Re-Test' value='Re-Test' class='reTest retestSave' style='margin-Top:0%;'/></div>");
        doAddOverAllPerformance(globalUserId, chapterNo, globalStudentStandard, subjectName, testMark);
        var date = new Date();
        var currDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        alert(date);

        jQ3.ajax({
            type: 'post',
            url: overallPerformance,
            dataType: 'json',
            data: { userId: globalUserId, chapterNo: chapterNo, standard: globalStudentStandard, subject: subjectName, highestMark: testMark, CurrDate: date },
            success: function (data) {

            }
        });
    }
    //------------------------------SCORE------------------------------

    jQ3('.question-wrap').html(" ");
    jQ3('.question-wrap').append('<h1 class="totalMarks" style="margin-top:-2%;">You scored ' + testMark + '0%</h1>');
    doShowTestSummary();
});


function nextQuestion() {
    jQ3('.question-wrap').html(" ");

	var totalAnsList = randomTenQuestions[countId].Answer;
	var correctAnsNo = randomTenQuestions[countId].CorrectAnswer;
	
	var j =0;
	correctAnswerText = "";
	for(var i=0; i< totalAnsList.length;i++){
        //air.Introspector.Console.log(totalAnsList[i].AnswerText+" == "+correctAnsNo);
		if(totalAnsList[i].AnswerText == correctAnsNo){
			correctAnswerText = totalAnsList[i].AnswerText;     
		}
		
	    var tempAnsNo = correctAnsNo.split(',');
	       
		if (tempAnsNo.length > 1 && j == 0) {
			correctAnswerText = tempAnsNo;
			j++;
		}				
	
	}
	
	correctAnswer = randomTenQuestions[countId].CorrectAnswer;
    
    var answerText = randomTenQuestions[countId].Answer;
    str = "<h3 class='noofquestion'>Question " + countNoOfQuestion + " of 10</h3>";
    str += "<h4 class='questionText' style='font-family:Times New Roman;font-weight:bold;' >" + countNoOfQuestion + ']' + ' ' + randomTenQuestions[countId].QuestionText + "</h4>";

    for (var i = 0; i < 4; i++) {
        if (randomTenQuestions[countId].Title == "single") {
            str += "<input type='radio' name='radioName' id='" + i + "' value='" + answerText[i].AnswerText + "'  data-val='" + answerText[i].AnswerText + "'><label for='" + i + "' style='margin-left:3%;font-family:Arial;'>" + answerText[i].AnswerText + "</label><br></br>";
        }
        if (randomTenQuestions[countId].Title == "multiple") {
            str += "<input type='checkbox' name='checkBoxName' id='" + i + "' value='" + answerText[i].AnswerText + "' data-val='" + answerText[i].AnswerText + "'><label for='" + i + "' style='margin-left:3%;font-family:Arial'>" + answerText[i].AnswerText + "</label><br></br>";
        }
    }

    if ((countId + 1) != randomTenQuestions.length) {
        if (randomTenQuestions[countId].Title == "single") {
            str += "<br/><input type='button' name='next' value='Next' class='radioNextQuestion'/>";
        }
        else {
            str += "<br/><input type='button' name='next' value='Next' class='checkBoxNextQuestion'/>";
        }
    }
    else {
        if (randomTenQuestions[countId].Title == "single") {
            str += "<br/><input type='button' name='submit' value='Submit' class='radioSubmitQuestion'/>";
        }
        else {
            str += "<br/><input type='button' name='submit' value='Submit' class='checkBoxSubmitQuestion'/>";
        }
    }
    countId++;
    countNoOfQuestion++;
    jQ3('.question-wrap').append(str);
}