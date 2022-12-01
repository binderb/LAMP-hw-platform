var admin_grading_builder = {

    display_grade_by_question: function () {
        
        $('#container').empty();
        
        // build navigation controls
        $('#container').append('<h3 style="display:block;margin-bottom:10px;">Grading: '+window.assignment_data.name+'</div>');
        var s = '<div id="controls" style="margin-bottom:20px;">';
        s += '<a id="back" class="lite_button" style="min-width:100px;margin:5px;" href="">&larr; Back</a>';
        s += '<a id="save" class="lite_button" style="min-width:100px;margin:5px;" href="">Update</a>';
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        $('#container').append(s);
        
        admin_grading_builder.build_question_nav_panel($('#left_container'));
        $('#question_nav_panel').find('#1').click();
        
        $('#back').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="class_form" action="admin_assignment_class_view.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#class_form').submit();
        });
        $('#save').click( function(e) {
            e.preventDefault();
            $('#responseblock').text('Saving Updates...');
            $('#responseblock').css('background-color','var(--palette-green)');
            $('#responseblock').css('display','inline-block');
			$.ajax({
				url: 'admin/grades_update.php',
				method: 'POST',
				data: {
					"assignment_data" : window.assignment_data,
					"class_data"      : window.class_data
				},
				success: function (response) {
					if (response == "update_success") {
						$('#responseblock').text("Updates Saved.");
					} else {
						$('#responseblock').text(response);
            			$('#responseblock').css('background-color','var(--palette-red-alert)');
					}
				}
			});
        });
        
        
        return;
    },
    
    display_grade_by_student: function () {
        
        $('#container').empty();
        
        // build navigation controls
        $('#container').append('<h3 style="display:block;margin-bottom:10px;">Grading: '+window.assignment_data.name+'</div>');
        var s = '<div id="controls" style="margin-bottom:20px;">';
        s += '<a id="back" class="lite_button" style="min-width:100px;margin:5px;" href="">&larr; Back</a>';
        s += '<a id="save" class="lite_button" style="min-width:100px;margin:5px;" href="">Update</a>';
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        $('#container').append(s);
        
        admin_grading_builder.build_student_nav_panel($('#left_container'));
        //$('#student_nav_panel').find('#1').click();
        
        $('#back').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="class_form" action="admin_assignment_class_view.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#class_form').submit();
        });
        $('#save').click( function(e) {
            e.preventDefault();
            $('#responseblock').text('Saving Updates...');
            $('#responseblock').css('background-color','var(--palette-green)');
            $('#responseblock').css('display','inline-block');
			$.ajax({
				url: 'admin/grades_update.php',
				method: 'POST',
				data: {
					"assignment_data" : window.assignment_data,
					"class_data"      : window.class_data
				},
				success: function (response) {
					if (response == "update_success") {
						$('#responseblock').text("Updates Saved.");
					} else {
						$('#responseblock').text(response);
            			$('#responseblock').css('background-color','var(--palette-red-alert)');
					}
				}
			});
        });
        
        
        return;
    },
    
    build_question_nav_panel: function (parent) {
        var s = '<div id="question_nav_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:20px;">Question:</h3>';
        for (var i=0;i<window.question_data.length;i++) {
            s += '<a id="'+(i+1)+'" class="lite_button question_nav_button" style="margin:2px;">'+(i+1)+'</a>';
        }
        s += '<div id="question_prompt" style="display:block;margin-top:20px;"><b>Prompt:</b><br/></div>';
        s += '</div>';
        parent.append(s);
        
        $('.question_nav_button').click( function(e) {
            e.preventDefault();
            $('.question_nav_button').removeClass('selected');
            $(this).addClass('selected');
            admin_grading_builder.display_question(parseInt($(this).attr('id')));
        });
    },
    
    build_student_nav_panel: function (parent) {
        var s = '<div id="student_nav_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:20px;">Students:</h3>';
        // Create/refresh a list of student names from the class data.
        window.student_ids = [];
        window.student_firsts = [];
        window.student_lasts = [];
        for (var i=0;i<window.class_data.length;i++) {
            // Collate the class data
            if (!window.student_ids.includes(window.class_data[i].user_id)) {
                // This is the first database entry corresponding to this user.
                window.student_ids.push(window.class_data[i].user_id);
                window.student_firsts.push(window.class_data[i].first);
                window.student_lasts.push(window.class_data[i].last);
            }
        }
        
        for (var i=0;i<window.student_ids.length;i++) {
            s += '<a id="'+i+'" class="lite_button student_nav_button" style="margin:5px;">'+window.student_firsts[i]+' '+window.student_lasts[i]+'</a>';
        }
        s += '</div>';
        parent.append(s);
        
        $('.student_nav_button').click( function(e) {
            e.preventDefault();
            $('.student_nav_button').removeClass('selected');
            $(this).addClass('selected');
            admin_grading_builder.display_student(parseInt($(this).attr('id')));
        });
    },
    
    display_question: function (id) {
        filtered_data = window.class_data.filter(e => e.question_index == id);
        filtered_question = window.question_data.filter(e => e.question_index == id)[0];
        $('#right_container').empty();
        $('#question_prompt').html('<b>Prompt:</b><br/>'+JSON.parse(filtered_question.question_data).prompt);
        if (filtered_data.length == 0) {
        	// There is no response data logged for this question.
        	$('#right_container').html('<div style="display:block;width:100%;text-align:left;padding:15px;"><h3 style="margin-bottom:15px;">No Response Data</h3>No students have saved any responses for this question yet.</div>');
        } else {
			for (var i=0;i<filtered_data.length;i++) {
				admin_grading_builder.build_gbq_box($('#right_container'),filtered_question,filtered_data[i],i);
			}
		}
    },
    
    display_student: function (id) {
        filtered_data = window.class_data.filter(e => e.user_id == window.student_ids[id]);
        $('#right_container').empty();
        if (filtered_data[0].question_index === null) {
        	// Student hasn't started the assignment; there will only be one row with their name in student_data,
        	// and all the question-related data will be null in that row.
        	$('#right_container').html('<div style="display:block;width:100%;text-align:left;padding:15px;"><h3 style="margin-bottom:15px;">No Response Data</h3>Student has not saved any responses for the assignment yet.</div>');
        } else {
			for (var i=0;i<filtered_data.length;i++) {
				admin_grading_builder.build_gbs_box($('#right_container'),filtered_data[i],i);
			}
		}
    },
    
    build_gbq_box: function (parent, question_data, box_data, index) {
        var s = '<div id="gbq_'+box_data.user_id+'_'+box_data.question_index+'" class="white_panel" style="text-align:left;display:block;">';
        var the_response = "";
        if (box_data.response_data != "{}") {
        	the_response = JSON.parse(box_data.response_data).essay_response.replace(/\n/g,'<br/>');
        } else {
        	the_response = "<i>(No response)</i>";
        }
        s += '<h3 style="margin-bottom:0px;">'+box_data.first+' '+box_data.last+':</h3>';
        s += '<form id="question_form">';
        s += '<table style="width:100%;"><tbody>';
            s += '<tr><td colspan=2 style="text-align:left;color:blue;padding-bottom:10px;"><br/>';
                s += the_response;
            s += '</td></tr>';
            s += '<tr><td colspan=2><b>Points Earned (of '+question_data.question_points+'):<input type="text" name="score" maxlength="5" size="5" style="display:inline-block;margin-left:10px;color:var(--palette-dark-green);" value="'+box_data.score+'"></td></tr>';
            s += '<tr><td colspan=2><b>Feedback:</b><br><textarea name="feedback" rows="5" style="color:var(--palette-dark-green);margin-top:10px;">';
                s += box_data.feedback_data;
            s += '</textarea>';
        s += '</tbody></table>'
        s += '</form></div>';
        parent.append(s);
        $('#gbq_'+box_data.user_id+'_'+box_data.question_index+' input[name="score"]').on('change keyup paste', function() {
        	var changed_user = $('#gbq_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[1];
        	var changed_question = $('#gbq_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[2];
        	var changed_score = $(this).val();
        	if (parseInt(changed_score) === NaN || changed_score == "") changed_score = 0;
        	window.class_data.filter(e => (e.user_id == changed_user && e.question_index == changed_question))[0].score = parseFloat(changed_score);
        });
        $('#gbq_'+box_data.user_id+'_'+box_data.question_index+' textarea[name="feedback"]').on('change keyup paste', function() {
        	var changed_user = $('#gbq_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[1];
        	var changed_question = $('#gbq_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[2];
        	var changed_feedback = $(this).val();
        	window.class_data.filter(e => (e.user_id == changed_user && e.question_index == changed_question))[0].feedback_data = changed_feedback;
        });
    },
    
    build_gbs_box: function (parent, box_data, index) {
        var question_data = window.question_data.filter(e => e.question_index == box_data.question_index)[0];
        var s = '<div id="gbs_'+box_data.user_id+'_'+box_data.question_index+'" class="white_panel" style="text-align:left;display:block;">';
        var the_response = "";
        if (box_data.response_data != "{}") {
        	the_response = JSON.parse(box_data.response_data).essay_response.replace(/\n/g,'<br/>');
        } else {
        	the_response = "<i>(No response)</i>";
        }
        s += '<h3 style="margin-bottom:0px;">Question '+box_data.question_index+':</h3>';
        s += '<form id="question_form">';
        s += '<table style="width:100%;"><tbody>';
            s += '<tr><td colspan=2 style="text-align:left;"><br/>';
                s += JSON.parse(question_data.question_data).prompt;
            s += '</td></tr>';
            s += '<tr><td colspan=2 style="text-align:left;color:blue;padding-bottom:10px;"><br/>';
                s += the_response;
            s += '</td></tr>';
            s += '<tr><td colspan=2><b>Points Earned (of '+question_data.question_points+'):<input type="text" name="score" maxlength="5" size="5" style="display:inline-block;margin-left:10px;color:var(--palette-dark-green);" value="'+box_data.score+'"></td></tr>';
            s += '<tr><td colspan=2><b>Feedback:</b><br><textarea name="feedback" rows="5" style="color:var(--palette-dark-green);margin-top:10px;">';
                s += box_data.feedback_data;
            s += '</textarea>';
        s += '</tbody></table>'
        s += '</form></div>';
        parent.append(s);
        $('#gbs_'+box_data.user_id+'_'+box_data.question_index+' input[name="score"]').on('change keyup paste', function() {
        	var changed_user = $('#gbs_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[1];
        	var changed_question = $('#gbs_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[2];
        	var changed_score = $(this).val();
        	if (parseInt(changed_score) === NaN || changed_score == "") changed_score = 0;
        	window.class_data.filter(e => (e.user_id == changed_user && e.question_index == changed_question))[0].score = parseFloat(changed_score);
        });
        $('#gbs_'+box_data.user_id+'_'+box_data.question_index+' textarea[name="feedback"]').on('change keyup paste', function() {
        	var changed_user = $('#gbs_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[1];
        	var changed_question = $('#gbs_'+box_data.user_id+'_'+box_data.question_index).attr('id').split('_')[2];
        	var changed_feedback = $(this).val();
        	window.class_data.filter(e => (e.user_id == changed_user && e.question_index == changed_question))[0].feedback_data = changed_feedback;
        });
    },
    
    get_formatted_date: function (date,display_time,tfh) {
        var year = date.getFullYear();

        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;

        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        
        var time = date.toLocaleTimeString('en-US',{hour: "2-digit", minute: "2-digit"});
        if (tfh) {
            time = date.toLocaleTimeString('en-US',{hour: "2-digit", minute: "2-digit", hour12: false});
        }
        if (display_time) {
            return month + '/' + day + '/' + year + ' ' + time;
        } else {
            return month + '/' + day + '/' + year;
        }
    }
    
    
}