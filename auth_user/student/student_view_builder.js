var student_view_builder = {

    display_view: function () {
        
        $('#container').empty();
        console.log("hello?");
        
        // build navigation controls
        //$('#container').append('<h3 style="display:block;margin-bottom:10px;">Grading: '+window.assignment_data.name+'</div>');
        var s = '<div id="controls" style="margin-bottom:20px;">';
        if (window.preview !== null && window.preview == true) {
        	s += '<a id="back_to_editor" class="lite_button" style="min-width:100px;margin:5px;" href="">&larr; Back</a>';
        } else {
			s += '<a id="back" class="lite_button" style="min-width:100px;margin:5px;" href="../common/auth_user/dashboard_student.php">&larr; Back</a>';
			s += '<a id="save" class="lite_button" style="min-width:100px;margin:5px;" href="">Save Changes</a>';
		}
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        $('#container').append(s);
        
        student_view_builder.build_question_nav_panel($('#left_container'));
        $('#question_nav_panel').find('#1').click();
        $('#responseblock').text('All changes saved.');
		$('#responseblock').css('background-color','var(--palette-green)');
		$('#responseblock').css('color','white');
		$('#responseblock').css('display','inline-block');
        
        // $('#back').click( function(e) {
//             e.preventDefault();
//             $('body').append('<form id="class_form" action="admin_assignment_class_view.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
//             $('#class_form').submit();
//         });
        $('#save').click( function(e) {
            e.preventDefault();
            $('#responseblock').text('Saving work...');
            $('#responseblock').css('background-color','var(--palette-green)');
			$('#responseblock').css('color','white');
            $('#responseblock').css('display','inline-block');
			$.ajax({
				url: 'student/responses_update.php',
				method: 'POST',
				data: {
					"assignment_data" : window.assignment_data,
					"response_data"   : window.response_data
				},
				success: function (response) {
					if (response == "update_success") {
						$('#responseblock').text("All changes saved.");
					} else {
						$('#responseblock').text(response);
            			$('#responseblock').css('background-color','var(--palette-red-alert)');
					}
				}
			});
        });
        $('#back_to_editor').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="editor_form" action="admin_assignment_editor.php" method="post"><input type="hidden" name="id" value="'+window.assignment_data.assignment_id+'"></form>');
            $('#editor_form').submit();
        });
        
        
        return;
    },
    
    build_question_nav_panel: function (parent) {
        var s = '<div id="question_nav_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:10px;">Question:</h3>';
        for (var i=0;i<window.question_data.length;i++) {
            s += '<a id="'+(i+1)+'" class="lite_button question_nav_button" style="margin:2px;">'+(i+1)+'</a>';
        }
        s+= '<h3 style="margin-bottom:10px;margin-top:10px;">Assignment Info:</h3>';
        s+= '<table id="info_table"><tbody>';
        var available_date = new Date(window.assignment_data.available.replace(' ','T')+"Z");
        var due_date = window.assignment_data.due.replace(' ','T');
        // Can't add the "Z" without checking here, since extensions are stored in ISO format
		// and regular dates get stored in MySQL format (without the Z)
		if (!due_date.includes('Z')) due_date = due_date + 'Z';
		var due_date = new Date(due_date);
		var now = new Date();
		var assignment_status = "";
		if (now <= due_date && window.assignment_data.extended == null) assignment_status = '<span style="color:var(--palette-green);font-weight:900;">Open</span>';
		else if (now <= due_date && window.assignment_data.extended != null) assignment_status = '<span style="color:var(--palette-green);font-weight:900;">Open - Extended</span>';
		else if (now > due_date && window.assignment_data.graded == 0) assignment_status = '<span style="color:black;font-weight:900;">Past Due</span>';
		else if (now > due_date && window.assignment_data.graded == 1) assignment_status = '<span style="color:var(--palette-blue);font-weight:900;">Graded</span>';
				
        s+= '<tr><td style="padding-right:10px;"><b>Available From:</b></td><td>'+student_view_builder.get_formatted_date(available_date,true)+'</td></tr>';
        s+= '<tr><td style="padding-right:10px;"><b>Due:</b></td><td>'+student_view_builder.get_formatted_date(due_date,true)+'</td></tr>';
        s+= '<tr><td style="padding-right:10px;"><b>Status:</b></td><td id="status">'+assignment_status+'</td></tr>';
        parent.append(s);
        
        $('.question_nav_button').click( function(e) {
            e.preventDefault();
            $('.question_nav_button').removeClass('selected');
            $(this).addClass('selected');
            student_view_builder.display_question(parseInt($(this).attr('id')));
        });
    },
    
    display_question: function (id) {
        filtered_question = window.question_data.filter(e => e.question_index == id)[0];
        filtered_response = window.response_data.filter(e => e.question_index == id)[0];
        filtered_score = window.score_data.filter(e => e.question_index == id)[0];
        $('#right_container').empty();
		student_view_builder.build_q_box($('#right_container'),filtered_question,filtered_response,filtered_score);
    },
    
    
    build_q_box: function (parent, question_data, response_data, score_data) {
        var question_data_object = JSON.parse(question_data.question_data);
        var s = '<div id="q_'+question_data.question_index+'" class="white_panel" style="text-align:left;display:block;margin-top:0px;">';
        var the_response = "";
        if (response_data.response_data != "{}") {
        	if (question_data_object.type == "essay") {
        		the_response = JSON.parse(response_data.response_data).essay_response;
        	}
        } else {
        	the_response = "";
    	}
        var show_feedback = false;
        var lock_question = false;
        // The question will be locked and feedback displayed ONLY IF
        // the graded flag is set, AND at least one score field is not empty.
        // This enables us to provide early feedback by toggling the graded flag
        // after grading a few assignments while the time window is still open.
        // People with no grading marks should be able to edit as normal. 
        if (window.assignment_data.graded == 1 && !(score_data.score == 0 && score_data.feedback_data == "")) {
        	show_feedback = true; 
        	lock_question = true;
        }
        if ($('#status').text() == "Past Due") lock_question = true;
        s += '<h3 style="margin-bottom:10px;">Question #'+question_data.question_index+':</h3>';
        s += '<form id="question_form">';
        	s += '<div id="prompt">'+question_data_object.prompt+'</div>';
        	if (question_data_object.type == "essay") {
        		if (question_data_object.graphics_type != null && question_data_object.graphics_type == "image") {
        			if (question_data_object.graphics_maxwidth != null && question_data_object.graphics_maxwidth != null) {
        				s += '<div id="img_'+question_data.question_index+'_container" style="display:block;width:100%;text-align:center;">';
        				s += '<div id="img_'+question_data.question_index+'" style="';
        				s += 'display:inline-block;';
        				s += 'margin-top: 10px;';
        				s += 'background-image:url(../../server/'+question_data_object.graphics_url+');';
        				s += 'background-position:center;';
        				s += 'background-repeat: no-repeat;';
        				s += 'background-size:contain;';
        				s += 'width: min(100%, '+question_data_object.graphics_maxwidth+'px);';
        				s += 'height: 0;';
        				s += 'padding-bottom: min(calc(100% * '+question_data_object.graphics_maxheight+' / '+question_data_object.graphics_maxwidth+'), '+question_data_object.graphics_maxheight+'px);';
        				s += '"></div></div>';
        			} else {
        			
        			}
        		}
				if (show_feedback) {
					s += '<div style="margin-top:10px;font-weight:900;color:var(--palette-green)">Score: '+score_data.score+'/'+question_data.question_points+'</div>';
					s += '<div style="font-weight:900;color:var(--palette-green)">'+score_data.feedback_data+'</div>';
				}
				s += '<textarea name="response" rows="8" style="margin-top:15px;">';
					s += the_response;
				s += '</textarea>';
			}
        s += '</form></div>';
        parent.append(s);
        $('#q_'+question_data.question_index+' textarea[name="response"]').on('change keyup paste', function() {
        	var changed_question = $('#q_'+question_data.question_index).attr('id').split('_')[1];
        	var changed_response = JSON.stringify({
        		"essay_response" : $(this).val()
        	});
        	window.response_data.filter(e => (e.question_index == changed_question))[0].response_data = changed_response;
        	$('#responseblock').text('Unsaved changes.');
            $('#responseblock').css('background-color','var(--palette-blue)');
            $('#responseblock').css('color','white');
            $('#responseblock').css('display','inline-block');
        });
        if (lock_question) {
        	$('#q_'+question_data.question_index+' textarea[name="response"]').prop('disabled',true);
        }
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