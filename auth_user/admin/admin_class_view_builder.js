var admin_class_view_builder = {

    display_class_view: function () {
        
        $('#container').empty();
        $('#container').append('<h3 style="display:block;margin-bottom:10px;">Viewing: '+window.assignment_data.name+'</div>');
        
        // build navigation controls
        var s = '<div id="controls" style="margin-bottom:20px;">';
        s += '<a class="lite_button" style="min-width:100px;margin:5px;" href="../common/auth_user/dashboard_admin.php">&larr; Back</a>';
        //s += '<a id="preview" class="lite_button" style="min-width:100px;margin:5px;" href="">Preview</a>';
        //s += '<a id="save" class="lite_button" style="min-width:100px;margin:5px;" href="">'+save_text+'</a>';
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:65%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:35%;vertical-align:top;"></div>';
        $('#container').append(s);
        admin_class_view_builder.build_class_panel($('#left_container'));
        admin_class_view_builder.build_grading_panel($('#right_container'));
        
        
        return;
        
        
        
        $('#right_container').append(admin_dashboard_builder.build_assignments_panel());
        admin_dashboard_builder.update_users_panel();
        admin_dashboard_builder.update_assignments_panel();
    },
    
    build_class_panel: function (parent) {
        var s = '<div id="class_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:15px;">Class Statistics:</h3>';
        if (window.class_data.length == 0) {
        	s += 'No students found in the current class section. Note that users with ratings other than "student" will not appear here.';
        } else {
			s += '<a id="update_extensions" class="lite_button" href="">Update Extensions</a>';
			s += '<table id="class_table" style="margin-top:10px;table-layout:fixed;word-wrap:break-word;width:100%;"><thead><tr>';
			s += '<th style="width:20%;"><b>First Name</b></th>';
			s += '<th style="width:20%;"><b>Last Name</b></th>';
			s += '<th style="width:20%;"><b>Responses</b></th>';
			s += '<th style="width:10%;"><b>Score</b></th>';
			s += '<th style="width:30%;"><b>Extensions</b></th>';
			s += '</tr></thead><tbody>';
			window.extensions = {};
			if (window.assignment_data.extensions !== "") window.extensions = JSON.parse(window.assignment_data.extensions);
			var existing_usernames = [];
			var firsts = [];
			var lasts = [];
			var response_blocks = [];
			var score_total = [];
			var extension_html = [];
			for (var i=0;i<window.class_data.length;i++) {
				// Collate the class data
				if (!existing_usernames.includes(window.class_data[i].username)) {
					// This is the first database entry corresponding to this user.
					existing_usernames.push(window.class_data[i].username);
					firsts.push(window.class_data[i].first);
					lasts.push(window.class_data[i].last);
				
					if (window.class_data[i].response_data !== null) {
						var all_blank = true;
						var response_fields = JSON.parse(window.class_data[i].response_data);
						for (var r in response_fields) if (response_fields[r] != "") all_blank = false;
						if (all_blank) response_blocks.push('<span style="background-color:#CCC;display:inline-block;width:10px;height:10px;margin:1px;"></span>');
						else response_blocks.push('<span style="background-color:#60b369;display:inline-block;width:10px;height:10px;margin:1px;"></span>');
					} else {
						response_blocks.push('<span style="color:#A20000">Not Started</span>');
					}
					if (window.class_data[i].score !== null) {
						score_total.push(parseFloat(window.class_data[i].score));
					} else {
						score_total.push('<span style="color:#A20000">Not Graded</span>');
					}
					if (extensions.hasOwnProperty(window.class_data[i].user_id)) {
						var extension_date_i = new Date(extensions[window.class_data[i].user_id]);
						extension_date_i = admin_class_view_builder.get_formatted_date(extension_date_i,true,true);
						extension_html.push('<form id="extension_form_'+window.class_data[i].user_id+'" style="display:inline-block;margin-right:10px;vertical-align:middle;"><input class="datepicker" type="text" name="'+window.class_data[i].user_id+'" style="width:120px;display:inline-block;" value="'+extension_date_i+'"></form><a id="'+window.class_data[i].user_id+'" class="red_square_button remove_extension remove_extension_'+window.class_data[i].user_id+'" href="">&#215;</a>');
					} else {
						extension_html.push('<a id="'+window.class_data[i].user_id+'" class="square_button add_extension" href="">+</a>');
					}
				} else {
					// We've seen this user already.
					if (window.class_data[i].response_data !== null) {
						var all_blank = true;
						var response_fields = JSON.parse(window.class_data[i].response_data);
						for (var r in response_fields) if (response_fields[r] != "") all_blank = false;
						if (all_blank) response_blocks_next = '<span style="background-color:#CCC;display:inline-block;width:10px;height:10px;margin:1px;"></span>';
						else response_blocks_next = '<span style="background-color:#60b369;display:inline-block;width:10px;height:10px;margin:1px;"></span>';
						response_blocks[response_blocks.length-1] += response_blocks_next;
					}
					if (window.class_data[i].score !== null) {
						score_total[score_total.length-1] += window.class_data[i].score;
					}
				}
			}
			for (var i=0;i<existing_usernames.length;i++) {
				s += '<tr>';
				s += '<td>'+firsts[i]+'</td>';
				s += '<td>'+lasts[i]+'</td>';
				s += '<td>'+response_blocks[i]+'</td>';
				if (score_total[i] == '<span style="color:#A20000">Not Graded</span>') s += '<td>'+score_total[i]+'</td>';
				else s += '<td>'+score_total[i]+'/'+window.total_points+'</td>';
				s += '<td>'+extension_html[i]+'</td>';
				s += '</tr>';
			}
			s += '</tbody></table>';
        }
        
        parent.append(s);
        $('.add_extension').click( function(e) {
        	e.preventDefault();
        	admin_class_view_builder.enable_add_extension(e, $(this));
        });
        $('.remove_extension').click( function(e) {
        	e.preventDefault();
        	admin_class_view_builder.enable_remove_extension(e, $(this));
        });
        $('#update_extensions').click (function (e) {
        	e.preventDefault();
        	$("#responseblock").css("display","inline-block");
			$("#responseblock").css("margin-bottom","20px");
			$("#responseblock").css("background-color","var(--palette-green)");
			$("#responseblock").css("padding","15px");
			$("#responseblock").html("<b>Updating Extensions...</b>");
			var all_extension_data = {};
			$('form[id^="extension_form_"]').each( function(index) {
				var extension_id_i = $(this).find('.datepicker').attr("name");
				var extension_date_i = $(this).find('.datepicker').val();
				if (extension_date_i != "") {
					extension_date_i = new Date(extension_date_i).toISOString();
					all_extension_data[extension_id_i] = extension_date_i;
				}
			});
			$.ajax({
				url: 'admin/assignment_update_extensions.php',
				method: 'POST',
				data: {"extension_data" : JSON.stringify(all_extension_data), "assignment_id" : window.assignment_data.assignment_id},
				success: function (response) {
					if (response == "update_success") {
						$('#responseblock').text("Extensions Updated.");
						// Really should reload the classwide variables here.
						// Would do so except the PHP script that does this is written
						// to work in the header on page load. Need to decide if it's
						// a good idea to implement a switch in that function for
						// different output.
					} else {
						$('#responseblock').css('background-color','var(--palette-red-alert)');
						$('#responseblock').text(response);
					}
				}
			});
        });
        
        $( function() {
            $(".datepicker").datetimepicker();
        });

    },
    
    enable_add_extension: function (e, this_object) {
		e.preventDefault();
		this_object.parent().html('<form id="extension_form_'+this_object.attr("id")+'" style="display:inline-block;margin-right:10px;vertical-align:middle;"><input class="datepicker" type="text" name="'+this_object.attr("id")+'" style="width:120px;display:inline-block;"></form><a id="'+this_object.attr("id")+'" class="red_square_button remove_extension remove_extension_'+this_object.attr("id")+'" href="">&#215;</a>');
		$(".datepicker").datetimepicker();
		$(".remove_extension_"+this_object.attr("id")).click( function (e) {
			admin_class_view_builder.enable_remove_extension(e,$(".remove_extension_"+this_object.attr("id")));
		});
    },
    
    enable_remove_extension: function (e, this_object) {
		e.preventDefault();
		this_object.parent().html('<a id="'+this_object.attr("id")+'" class="square_button add_extension add_extension_'+this_object.attr("id")+'" href="">+</a>');
		$(".add_extension_"+this_object.attr("id")).click( function (e) {
			admin_class_view_builder.enable_add_extension(e,$(".add_extension_"+this_object.attr("id")));
		});
	},
    
    build_grading_panel: function (parent) {
        var s = '<div class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:10px;">Grading Controls:</h3>';
        s += '<p style="margin-bottom:10px;">Current Status: <span id="graded_text" style="font-weight:900;">'+(window.assignment_data.graded > 0 ? 'Graded' : 'Not Graded')+'</span></p>';
        s += '<a id="graded_toggle" class="lite_button" style="margin:10px;" href="">Switch Status</a>';
        s += '<br/>';
        s += '<a id="grade_by_question" class="lite_button" style="margin:10px;" href="">Grade by Question</a>';
        s += '<a id="grade_by_student" class="lite_button" style="margin:10px;" href="">Grade by Student</a>';
        s += '</div>';
        parent.append(s);
        $('#grade_by_question').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="grading_form" action="admin_grade_by_question.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#grading_form').submit();
        });
        $('#grade_by_student').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="grading_form" action="admin_grade_by_student.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#grading_form').submit();
        });
        $('#graded_toggle').click( function(e) {
        	e.preventDefault();
        	$('#graded_text').text('Updating...');
        	var new_graded = (parseInt(window.assignment_data.graded) == 0 ? 1 : 0);
        	$.ajax({
        		url: 'admin/set_graded_status.php',
        		method: 'POST',
        		data: {
        			"assignment_id" : window.assignment_data.assignment_id,
        			"graded"        : new_graded,
        		},
        		success: function (response) {
					if (response == "connection_error") {
						$('#graded_text').text('Error: Could not connect to the database.');
					} else if (response == "invalid_access") {
						$('#graded_text').text('Error: Invalid access.');
					} else if (response == "update_success") {
						window.assignment_data.graded = new_graded;
						$('#graded_text').text((window.assignment_data.graded > 0 ? 'Graded' : 'Not Graded'));
						$('#responseblock').css('display','none');
					}
        		}
        	});
        });
    },
    
    build_question_box: function (parent, question_data, is_saved_question) {
        var question_index = question_data;
        if (is_saved_question) question_index = question_data.question_index;
        var s = '<div id="question_'+question_index+'" class="white_panel" style="text-align:left;display:block;">';
        s += '<h3 style="margin-bottom:20px;">Question '+question_index+':</h3>';
        s += '<form id="question_form">';
        s += '<table style="width:100%;"><tbody>';
            s += '<tr><td style="text-align:left;"><b>Category:</b></td><td><input type="text" name="category"></td></tr>';
            s += '<tr><td style="text-align:left;"><b>Points: </b></td><td><input type="text" name="points"></td></tr>';
            s += '<tr><td colspan=2 style="text-align:left;"><b>JSON:</b><br/><br/><textarea name="content" style="min-height:100px;">';
                s += '{"type":"essay",\n"prompt":"This is the prompt for our assignment."}';
            s += '</textarea></td></tr>';
        s += '</tbody></table>'
        s += '</form></div>';
        parent.append(s);
        if (is_saved_question) {
            $('#question_'+question_index).find('input[name="category"]').val(question_data.question_category);
            $('#question_'+question_index).find('input[name="points"]').val(question_data.question_points);
            $('#question_'+question_index).find('textarea[name="content"]').val(question_data.question_data);
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