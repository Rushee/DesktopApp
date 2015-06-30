
function backButton() {
    location.reload();
    jQ10('#main-div').hide();
    jQ10('.answerFromDb').hide();
    jQ10('.statustable').show();
    jQ10('.dislay-table').show();
    jQ10('.addButton').show();

}
function addQuery() {
    jQ10(".submitBlogs").attr('value', 'Submit');
    jQ10('.statustable').hide();
    jQ10('#main-div').show();
    jQ10('.addButton').hide();
    jQ10('.back').show();
    jQ10('.dislay-table').hide();
    jQ10('.answerFromDb').hide();
}


function submitBlog(obj) {
if(obj.attr("value") == "Edit"){
if (jQ10('.subject').val() == "" && jQ10('.title').val() == "" && jQ10('.description').val() == "" && jQ10('.chapter').val() == "" && jQ10('.section').val() == "") {
        alert("Please enter blank field");
    }
    else if (jQ10('.subject').val() == "") {
        alert('Subject Field is Blank');
    }
    else if (jQ10('.title').val() == "") {
        alert('Title Field is Blank');
    }
    else if (jQ10('.chapter').val() == "") {
        alert('Chapter Field is Blank');
    }
    else if (jQ10('.section').val() == "") {
        alert('Section Field is Blank')
    }
    else if (jQ10('.description').val() == "") {
        alert('Description Field is Blank');
    }
    else {
        var subject = jQ10('.subject').val();
        var title = jQ10('.title').val();
        var chapter = jQ10('.chapter').val();
        var section = jQ10('.section').val();
        var description = jQ10('.description').val();

        doEditQueryLogs(jQ10(".hiddenField").val(), globalUserId, subject, title, chapter, section, description);

        jQ10('.subject').val(' ');
        jQ10('.title').val(' ');
        jQ10('.chapter').val(' ');
        jQ10('.section').val(' ');
        jQ10('.description').val(' ');
        alert('Query Edited Successfully');
        backButton();
    }

}
else{
     if (jQ10('.subject').val() == "" && jQ10('.title').val() == "" && jQ10('.description').val() == "" && jQ10('.chapter').val() == "" && jQ10('.section').val() == "") {
        alert("Please enter blank field");
    }
    else if (jQ10('.subject').val() == "") {
        alert('Subject Field is Blank');
    }
    else if (jQ10('.title').val() == "") {
        alert('Title Field is Blank');
    }
    else if (jQ10('.chapter').val() == "") {
        alert('Chapter Field is Blank');
    }
    else if (jQ10('.section').val() == "") {
        alert('Section Field is Blank')
    }
    else if (jQ10('.description').val() == "") {
        alert('Description Field is Blank');
    }
    else {
        var subject = jQ10('.subject').val();
        var title = jQ10('.title').val();
        var chapter = jQ10('.chapter').val();
        var section = jQ10('.section').val();
        var description = jQ10('.description').val();

        doInsertQueryLogs(globalUserId, subject, title, chapter, section, description);

        jQ10('.subject').val(' ');
        jQ10('.title').val(' ');
        jQ10('.chapter').val(' ');
        jQ10('.section').val(' ');
        jQ10('.description').val(' ');
        alert('Query Submit Successfully');
        backButton();
    }
}


   
}