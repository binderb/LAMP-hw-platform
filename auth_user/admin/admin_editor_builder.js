var admin_editor_builder = {

    display_editor: function () {
        
        $('#container').empty();
        
        // build navigation controls
        var save_text = "Update";
        if (window.loaded_assignment_id == -1) {
            $('#container').append('<h3 id="page_header" style="display:block;margin-bottom:10px;">New Assignment</div>');
            save_text = "Post";
        } else {
            $('#container').append('<h3 id="page_header" style="display:block;margin-bottom:10px;">Editing: '+window.assignment_data.name+'</div>');
        }
        var s = '<div id="controls" style="margin-bottom:20px;">';
        s += '<a class="lite_button" style="min-width:100px;margin:5px;" href="../common/auth_user/dashboard_admin.php">&larr; Back</a>';
        s += '<a id="preview" class="lite_button" style="min-width:100px;margin:5px;" href="">Preview</a>';
        s += '<a id="save" class="lite_button" style="min-width:100px;margin:5px;" href="">'+save_text+'</a>';
        s += '</div>';
        s += '<div id="left_container" style="display:inline-block;text-align:left;margin:0px;width:35%;vertical-align:top;"></div>';
        s += '<div id="right_container" style="display:inline-block;text-align:right;margin:0px;width:65%;vertical-align:top;"></div>';
        $('#container').append(s);
        admin_editor_builder.build_global_panel($('#left_container'));
        admin_editor_builder.build_layout_panel($('#right_container'));
        
        $('#preview').click( function(e) {
            e.preventDefault();
            $('body').append('<form id="preview_form" action="admin_assignment_preview.php" method="post"><input type="hidden" name="id" value="'+window.loaded_assignment_id+'"></form>');
            $('#preview_form').submit();
        });
        $('#save').click( function(e) {
            e.preventDefault();
            $('#responseblock').text('Saving...');
            $('#responseblock').css('background-color','var(--palette-green)');
            $('#responseblock').css('display','inline-block');
            if ($('input#assignment_title').val() == "" || $('input#available_from').val() == "" || $('input#due_date').val() == "") {
            	$('#responseblock').text('Error: Make sure all global settings are populated before saving.');
				$('#responseblock').css('background-color','var(--palette-red-alert)');
            } else {
				var created_timestamp = new Date();
				created_timestamp = created_timestamp.toISOString();
				if (window.loaded_assignment_id > -1) created_timestamp = window.assignment_data.created;
				var available_timestamp = new Date($('input#available_from').val());
				available_timestamp = available_timestamp.toISOString();
				var due_timestamp = new Date($('input#due_date').val());
				due_timestamp = due_timestamp.toISOString();
				var graded = 0;
				if (window.loaded_assignment_id > -1) graded = window.assignment_data.graded;
				var extensions = "";
				if (window.loaded_assignment_id > -1) extensions = window.assignment_data.extensions;
				$.ajax({
					url: 'admin/assignment_save.php',
					method: 'POST',
					data: {
						"assignment_id" : window.loaded_assignment_id,
						"class_id"      : window.assignment_data.class_id,
						"name"          : $('input#assignment_title').val(),
						"created"       : created_timestamp,
						"available"     : available_timestamp,
						"due"           : due_timestamp,
						"graded"        : graded,
						"extensions"    : extensions,
						"question_data" : JSON.stringify(window.question_data)
					},
					success: function (response) {
						if (response == "connection_error") {
							$('#responseblock').text('Error: Could not connect to the database.');
							$('#responseblock').css('background-color','var(--palette-red-alert)');
						} else if (response == "invalid_access") {
							$('#responseblock').text('Error: Invalid access.');
							$('#responseblock').css('background-color','var(--palette-red-alert)');
						} else {
							//$('#responseblock').text(response);
							window.loaded_assignment_id = parseInt(response);
							window.assignment_data = {
								"assignment_id" : parseInt(response),
								"class_id"      : window.assignment_data.class_id,
								"name"          : $('input#assignment_title').val(),
								"created"       : created_timestamp,
								"available"     : available_timestamp,
								"due"           : due_timestamp,
								"graded"        : graded,
								"extensions"    : extensions
							};
							$('#responseblock').text("Assignment saved successfully.");
							$('#page_header').text('Editing: '+window.assignment_data.name);
							$('#save').text('Update');
						}
					}
				});
			}
        });
        
        
        return;
        
        
        
        $('#right_container').append(admin_dashboard_builder.build_assignments_panel());
        admin_dashboard_builder.update_users_panel();
        admin_dashboard_builder.update_assignments_panel();
    },
    
    build_global_panel: function (parent) {
        var s = '<div class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 style="margin-bottom:20px;">Assignment Settings:</h3>';
        s += '<form id="global_form">';
        s += '<table style="width:100%;"><tbody>';
        s += '<tr><td style="text-align:left;"><b>Assignment Title:</b></td>';
        s += '<td><input type="text" id="assignment_title" name="assignment_title"></td></tr>';
        s += '<tr><td style="text-align:left;"><b>Available From: </b></td>';
        s += '<td><input class="datepicker" type="text" id="available_from" name="available_from"></td></tr>';
        s += '<tr><td style="text-align:left;"><b>Due Date: </b></td>';
        s += '<td><input class="datepicker" type="text" id="due_date" name="due_date"></td></tr>';
        s += '</tbody></table></form></div>';
        parent.append(s);
        $( function() {
            $(".datepicker").datetimepicker();
        });
        if (window.loaded_assignment_id != -1) {
            var available = admin_editor_builder.get_formatted_date(new Date(window.assignment_data.available.replace(' ','T')+'Z'),true,true);
            var due = admin_editor_builder.get_formatted_date(new Date(window.assignment_data.due.replace(' ','T')+'Z'),true,true);
            $('#assignment_title').val(window.assignment_data.name);
            $('#available_from').val(available);
            $('#due_date').val(due);
        }
    },
    
    build_layout_panel: function (parent) {
        var s = '<div id="layout_panel" class="white_panel" style="display:inline-block;text-align:left;margin:0px;margin-bottom:10px;vertical-align:top;width:calc(100% - 45px);">';
        s += '<h3 id="layout_header" style="margin-bottom:10px;">Questions:</h3>';
        s += '<a id="add_question" class="lite_button" style="margin:5px;" href="">Add Question</a>';
        s += '<table id="layout_table">';
        s += '<thead>';
            s += '<th style="width:70%;"></th>';
            s += '<th style="width:10%;"></th>';
            s += '<th style="width:20%;"></th>';
        s += '</thead><tbody>';
        s += '</tbody>';
        s += '</table>';
        //s = '<a id="add_question" class="square_button" href="">+</a>';
        parent.append(s);
        admin_editor_builder.update_layout_header();
        if (window.loaded_assignment_id > -1) {
            for (var i=0;i<window.question_data.length;i++) {
                admin_editor_builder.build_question_cell($('#layout_table tbody'),window.question_data[i],true);
            }
        }
        $('tbody').sortable({
        	helper: admin_editor_builder.fixHelperModified,
            stop: admin_editor_builder.updateIndex
        }).disableSelection();
        $('#add_question').click( function(e) {
        	e.preventDefault();
        	$('body').append('<div class="modal"></div>');
			$('.modal').append('<div id="add_modal" class="modal_content"></div>');
			admin_editor_builder.display_add_new_question(null);
        });
    },
    
    display_add_new_question: function (question_data) {
    	window.current_tags = [];
    	window.new_question_data = "";
    	if (question_data != null) window.new_question_data = question_data.question_data;
    	var s = '<h3 style="margin-bottom:10px;">Adding Question</h3>';
    	s += '<div id="subnavigation" style="display:block;margin-bottom:10px;">';
    		s += '<a id="new_question" class="subnavigation_link selected" href="">New Question</a>';
    		s += '&nbsp;|&nbsp;';
    		s += '<a id="question_bank" class="subnavigation_link" href="">Question Bank</a>';
    	s += '</div>';
    	s += '<div id="question_editor" style="display:block;width:100%;text-align:left;">';
			s += '<div id="title" style="margin:5px;"><b>Title: </b><input type="text" name="title" maxlength="50" size="25"></div>';
			s += '<div id="tags" style="margin:5px;"><b>Tags: </b>';
			s += '</div>';
			s += '<div id="points" style="margin:5px;"><b>Points in This Assignment: </b><input type="text" name="points" maxlength="3" size="3"></div>';
			s += '<div id="type" style="margin:5px;"><b>Editor: </b>';
			s += '<select id="editor_type">';
				s += '<option value="raw">Raw JSON</option>';
				s += '<option value="essay">Essay</option>';
				s += '<option value="mc">Multiple Choice</option>';
			s += '</select>';
			s += '</div>';
			s += '<div id="editor_title" style="margin:5px;"><b>Question Data:</b></div>';
			s += '<div id="editor">';
			s += '</div>';
		s += '</div>';
    	s += '<a id="cancel_add" class="lite_button" style="margin:5px;" href="">Cancel</a>';
    	s += '<a id="savenew_add" class="lite_button_green" style="margin:5px;" href="">Add New Question</a>';
    	$('#add_modal').append(s);
    	if (question_data != null) {
			$('input[name="title"]').val(question_data.question_title);
			window.current_tags = JSON.parse(question_data.question_tags);
			for (const i in window.current_tags) { 
				$('#tags').append('<div class="question_tag">'+window.current_tags[i]+'</div>');
			}
			$('input[name="points"]').val(question_data.question_points);
		}
    	$('#new_question').click ( function(e) {
    		e.preventDefault();
    	});
    	$('#question_bank').click ( function(e) {
    		e.preventDefault();
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_question_bank();
    	});
    	$('#cancel_add').click( function(e) {
    		e.preventDefault();
    		$('.modal').remove();
    	});
    	$('#editor_type').change( function(e) {
    		$('#editor').empty();
    		var s = "";
    		switch($(this).val()) {
    		case "raw":
    			s += '<textarea name="content" style="min-height:150px;width:calc(100% - 10px);"></textarea>';
    			$('#editor').append(s);
    			if (window.new_question_data != null) {
					$('textarea[name="content"]').val(window.new_question_data);
				}
				$('textarea[name="content"]').on('change keyup paste', function() {
					window.new_question_data = $(this).val();
				});
    			break;
    		case "essay":
    			s += '<div id="prompt_title" style="margin:5px;"><b>Prompt:</b></div>';
    			s += '<textarea name="prompt" style="min-height:50px;width:calc(100% - 10px);"></textarea>';
    			s += '<div id="include_upload_title" style="margin:5px;"><b>Include File Upload: </b><input type="checkbox" name="include_upload"></div>';
    			s += '<div id="upload_options" style="display:none;">';
    				s += '<div id="include_upload_title" style="margin:5px;margin-left:15px;"><b>Hide Essay Box: </b><input type="checkbox" name="hide_essay_box"></div>';
    			s += '</div>';
    			s += '<div id="include_graphics_title" style="margin:5px;"><b>Include Graphics: </b><input type="checkbox" name="include_graphics"></div>';
    			s += '<div id="graphics_options" style="display:none;">';
    				s += '<div id="graphics_type_block" style="margin:5px;margin-left:15px;"><b>Graphics Type: </b><select id="graphics_type">';
    					s += '<option value="image">Image</option>';
    					s += '<option value="molfile">Molfile</option>';
    				s += '</select></div>';
    				s += '<div id="graphics_url_title" style="margin:5px;margin-left:15px;"><b>Graphics URL (relative to "server" directory):</b></div>';
    				s += '<input type="text" name="graphics_url" maxlength="75" style="width:calc(100% - 25px);margin-left:15px;">';
    				s += '<div id="maxwidth_title" style="margin:5px;margin-left:15px;"><b>Max Width:</b></div>';
    				s += '<input type="text" name="graphics_maxwidth" maxlength="75" size="5" style="margin-left:15px;">';
    				s += '<div id="maxheight_title" style="margin:5px;margin-left:15px;"><b>Max Height:</b></div>';
    				s += '<input type="text" name="graphics_maxheight" maxlength="75" size="5" style="margin-left:15px;">';
    			s += '</div>';
    			$('#editor').append(s);
				$('textarea[name="prompt"]').on('change keyup paste', function() {
					var new_data = {};
					new_data["type"] = "essay";
					new_data["prompt"] = $(this).val();
					if ($('input[name="include_upload"]').is(':checked')) {
						new_data["upload"] = "yes";
						if ($('input[name="hide_essay_box"]').is(':checked')) new_data["hide_essay_box"] = "yes";
					}
					if ($('input[name="include_graphics"]').is(':checked')) {
						new_data["graphics_type"] = $('#graphics_type').val();
    					if ($('input[name="graphics_url"]').val() != "") new_data["graphics_url"] = $('input[name="graphics_url"]').val();
    					if ($('input[name="graphics_maxwidth"]').val() != "") new_data["graphics_maxwidth"] = $('input[name="graphics_maxwidth"]').val();
    					if ($('input[name="graphics_maxheight"]').val() != "") new_data["graphics_maxheight"] = $('input[name="graphics_maxheight"]').val();
    				}
					window.new_question_data = JSON.stringify(new_data);
				});
				$('input[name="include_upload"]').click( function() {
					$('#upload_options').toggle(this.checked);
					$('textarea[name="prompt"]').change();
				});
				$('input[name="include_graphics"]').click( function() {
					$('#graphics_options').toggle(this.checked);
					$('textarea[name="prompt"]').change();
				});
				$('input[name="hide_essay_box"]').click( function() {
					$('textarea[name="prompt"]').change();
				});
				$('#graphics_type').change( function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_url"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_maxwidth"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_maxheight"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
				
				var question_object = null;
    			if (window.new_question_data != null) {
					try {
						question_object = JSON.parse(window.new_question_data);
					} catch(e) {
						// Invalid JSON.
					}
    				if (question_object != null) {
    					if (question_object.type == "essay") {
    						// Type matches, so fill in the fields.
    						$('textarea[name="prompt"]').val(question_object.prompt);
    						if (question_object.graphics_type != null) {
    							$('#graphics_type').val(question_object.graphics_type);
    							$('input[name="graphics_url"]').val(question_object.graphics_url);
    							$('input[name="graphics_maxwidth"]').val(question_object.graphics_maxwidth);
    							$('input[name="graphics_maxheight"]').val(question_object.graphics_maxheight);
    							$('input[name="include_graphics"]').click();
    						}
    						if (question_object.upload != null) {
    							$('input[name="include_upload"]').click();
    							if (question_object.hide_essay_box != null) $('input[name="hide_essay_box"]').click();
    						}
    					}
    				}
				}
    			break;
    		case "mc":
    			s += '<div id="prompt_title" style="margin:5px;"><b>Prompt:</b></div>';
    			s += '<textarea name="prompt" style="min-height:50px;width:calc(100% - 10px);"></textarea>';
    			s += '<div id="prompt_title" style="margin:5px;"><b>Choices:</b></div>';
    			$('#editor').append(s);
    			$('textarea[name="prompt"]').on('change keyup paste', function() {
					var new_data = {};
					new_data["type"] = "mc";
					new_data["prompt"] = $(this).val();
					window.new_question_data = JSON.stringify(new_data);
				});
				var question_object = null;
    			if (window.new_question_data != null) {
					try {
						question_object = JSON.parse(window.new_question_data);
					} catch(e) {
						// Invalid JSON.
					}
    				if (question_object != null) {
    					if (question_object.type == "mc") {
    						// Type matches, so fill in the fields.
    						$('textarea[name="prompt"]').val(question_object.prompt);
    					}
    				}
				}
    			break;
    		default:
    			break;
    		}
    		
    	});
    	$('#savenew_add').click( function(e) {
    		e.preventDefault();
    		// capture the new fields, then display confirmation message
    		var new_title = $('input[name="title"]').val();
			var new_tags = JSON.stringify(window.current_tags);
			var new_data = window.new_question_data;
			var new_points = $('input[name="points"]').val();
			var new_question = {
				"question_index" : window.question_data.length+1,
				"question_points": new_points,
				"question_id"    : -1,
				"question_tags"  : new_tags,
				"question_title" : new_title,
				"question_data"  : new_data
			}
    		$('#add_modal').empty();
			var s = '<h3 style="margin-bottom:10px;">Saving New Question</h3>';
            s += '<h3 style="margin-bottom:10px;">Are you sure?</h3>';
            s += 'Your edits will be saved as a new question in the question bank, and your new question will also be added to this assignment. Be sure that everything looks exactly the way you want it before you confirm! Questions can be edited later if needed.<br/><br/>';
            s += '<div id="status_block_savenew" style="display:none;font-weight:900;background-color:var(--palette-green);color:white;padding:15px;"></div>';
            s += '<a id="cancel_savenew" class="lite_button" style="margin:5px;" href="">&larr; Back</a>';
            s += '<a id="confirm_savenew" class="lite_button_green" style="margin:5px;" href="">Confirm</a>';
            s += '<a id="return_savenew" class="lite_button_green" style="margin:5px;display:none;" href="">Return to Layout</a>';
            $('#add_modal').append(s);
            $('#cancel_savenew').click( function(e) {
            	e.preventDefault();
            	$('#add_modal').empty();
            	admin_editor_builder.display_add_new_question(new_question);
            });
            $('#confirm_savenew').click( function(e) {
            	e.preventDefault();
            	$('#cancel_savenew').css('display','none');
            	$('#confirm_savenew').css('display','none');
            	$('#status_block_savenew').text('Saving...');
            	$('#status_block_savenew').css('display','block');
            	$.ajax({
            		url: 'admin/question_savenew.php',
            		method: 'POST',
            		data: new_question,
            		success: function (response) {
            			if (response == "connection_error") {
            				$('#status_block_savenew').text('Error: Could not connect to the database.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            			} else if (response == "invalid_access") {
            				$('#status_block_savenew').text('Error: Invalid access.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            			} else if (response == "title_exists") {
            				$('#status_block_savenew').text('Error: A question with the same title already exists.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            			} else {
            				var returned_question = JSON.parse(response)[0];
            				var question_to_add = {
								"question_index"  : window.question_data.length+1,
								"question_points" : new_question.question_points,
								"question_id"     : returned_question.question_id,
								"question_tags"   : returned_question.question_tags,
								"question_title"  : returned_question.question_title,
								"question_data"   : returned_question.question_data
							}
							window.question_data.push(question_to_add);
							admin_editor_builder.build_question_cell($('#layout_table'),question_to_add);
							admin_editor_builder.update_layout_header();
							$('#status_block_savenew').text('Updating local question bank...');
							$.ajax({
								url: 'admin/load_question_bank.php',
								method: 'POST',
								success: function (response) {
									window.question_bank = JSON.parse(response);
									$('.modal').remove();
								}
							});
            			}
            		}
            	});
            });
    	});
    	$('#editor_type').change();
    },
    
    display_add_question_bank: function () {
    	var s = '<h3 style="margin-bottom:10px;">Adding Question</h3>';
    	s += '<div id="subnavigation" style="display:block;margin-bottom:10px;">';
    		s += '<a id="new_question" class="subnavigation_link" href="">New Question</a>';
    		s += '&nbsp;|&nbsp;';
    		s += '<a id="question_bank" class="subnavigation_link selected" href="">Question Bank</a>';
    	s += '</div>';
    	s += '<div id="search" style="text-align:left;display:block;margin-bottom:15px;"><b>Search: </b><input name="bank_search" type="text" size="25" maxlength="50"></div>';
    	s += '<select id="bank" size="10" style="display:block;width:100%;font-size:14px;font-family:monospace;">';
    	s += '</select>';
    	s += '<a id="cancel_add" class="lite_button" style="margin:5px;" href="">Cancel</a>';
    	//s += '<a id="choose_add" class="lite_button_green" style="margin:5px;" href="">Choose Selected</a>';
    	$('#add_modal').append(s);
    	admin_editor_builder.update_bank(window.question_bank);
    	$('#new_question').click ( function(e) {
    		e.preventDefault();
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_new_question();
    	});
    	$('#question_bank').click ( function(e) {
    		e.preventDefault();
    	});
    	$('input[name="bank_search"]').on('change keyup paste', function() {
			var patt = new RegExp ($('input[name="bank_search"]').val().toLowerCase());
			var filtered = window.question_bank.filter(e => (patt.test(e.question_title.toLowerCase()) || patt.test(e.question_tags.toLowerCase()) || patt.test(e.question_data.toLowerCase()) ));
			admin_editor_builder.update_bank(filtered);
		});
    	$('#cancel_add').click( function(e) {
    		e.preventDefault();
    		$('.modal').remove();
    	});
    },
    
    update_bank: function (bank_contents) {
    	$('#bank').empty();
    	for (var i=0;i<bank_contents.length;i++) {
    		var question_title = bank_contents[i].question_title;
    		if (question_title == "") question_title = '(No Title)';
    		var s = '<option class="bank_option" value="'+bank_contents[i].question_id+'">id'+bank_contents[i].question_id+': '+question_title+'</option>';
    		$('#bank').append(s)
    	}
    	$('.bank_option').click( function(e) {
    		var chosen_question = window.question_bank.filter(e => e.question_id == $(this).val())[0];
    		window.this_question = {
    			"question_index" : 0,
    			"question_points": 1,
    			"question_id": chosen_question.question_id,
    			"question_tags" : chosen_question.question_tags,
    			"question_title" : chosen_question.question_title,
    			"question_data" : chosen_question.question_data
    		}
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_bank_chosen();
    	});
    },
    
    display_add_bank_chosen: function () {
    	var question_title = window.this_question.question_title;
		if (question_title === "") question_title = '<i>(no title)</i>';
    	var s = '<h3 style="margin-bottom:10px;">Adding Question</h3>';
    	s += '<div id="subnavigation" style="display:block;margin-bottom:10px;">';
    		s += '<a id="new_question" class="subnavigation_link" href="">New Question</a>';
    		s += '&nbsp;|&nbsp;';
    		s += '<a id="question_bank" class="subnavigation_link selected" href="">Question Bank</a>';
    	s += '</div>';
    	s += '<div id="question_summary" style="display:block;width:100%;text-align:left;">';
			s += '<div id="title" style="margin:5px;"><b>Title: '+question_title+'</b></div>';
			s += '<div id="tags" style="margin:5px;"><b>Tags: </b>';
			window.current_tags = JSON.parse(window.this_question.question_tags);
			for (const i in window.current_tags) { 
				s+= '<div class="question_tag">'+window.current_tags[i]+'</div>';
			}
			s += '</div>';
			s += '<div id="points" style="margin:5px;"><b>Points: </b><input type="text" name="points" maxlength="3" size="3"></div>';
			s += '<div id="preview_title" style="margin:5px;"><b>Question Preview:</b></div>';
			s += '<div id="preview_container" style="margin:5px;margin-bottom:15px;"></div>';
		s += '</div>';
		s += '<a id="back_add" class="lite_button" style="margin:5px;" href="">&larr; Back</a>';
		s += '<a id="cancel_add" class="lite_button" style="margin:5px;" href="">Cancel</a>';
		s += '<a id="clone_add" class="lite_button" style="margin:5px;" href="">Clone</a>';
		s += '<a id="confirm_add" class="lite_button_green" style="margin:5px;" href="">Add This Question</a>';
		
		$('#add_modal').append(s);
		$('input[name="points"]').val(window.this_question.question_points);
		admin_editor_builder.build_question_preview($('#preview_container'),JSON.parse(window.this_question.question_data));
		if (window.question_data.filter(e => e.question_id == window.this_question.question_id).length > 0) {
			$('#confirm_add').removeClass('lite_button_green');
			$('#confirm_add').addClass('red_button');
			$('#confirm_add').text('Question Already Added');
		}
		$('#new_question').click ( function(e) {
    		e.preventDefault();
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_new_question();
    	});
    	$('#question_bank').click ( function(e) {
    		e.preventDefault();
    	});
    	$('#back_add').click ( function(e) {
    		e.preventDefault();
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_question_bank();
    	});
    	$('#cancel_add').click ( function(e) {
    		e.preventDefault();
    		$('.modal').remove();
    	});
    	$('#clone_add').click (function(e) {
    		e.preventDefault();
    		$('#add_modal').empty();
    		admin_editor_builder.display_add_new_question(window.this_question);
    	});
    	$('#confirm_add').click (function(e) {
    		e.preventDefault();
    		if ($(this).text() == "Add This Question") {
				var question_to_add = {
					"question_index"  : window.question_data.length+1,
					"question_points" : parseInt($('input[name="points"]').val()),
					"question_id"     : window.this_question.question_id,
					"question_tags"   : window.this_question.question_tags,
					"question_title"  : window.this_question.question_title,
					"question_data"   : window.this_question.question_data
				}
				window.question_data.push(question_to_add);
				admin_editor_builder.build_question_cell($('#layout_table'),question_to_add);
				admin_editor_builder.update_layout_header();
				$('.modal').remove();
			}
    	});
    },
    
    display_question_details: function () {
    	var question_title = window.this_question.question_title;
		if (question_title === "") question_title = '<i>(no title)</i>';
		window.current_tags = JSON.parse(window.this_question.question_tags);
		var s = '<h3 style="margin-bottom:10px;">Question Details</h3>';
		s += '<div id="question_summary" style="display:block;width:100%;text-align:left;">';
			s += '<div id="title" style="margin:5px;"><b>Title: '+question_title+'</b></div>';
			s += '<div id="tags" style="margin:5px;"><b>Tags: </b>';
			for (const i in window.current_tags) { 
				s+= '<div class="question_tag">'+window.current_tags[i]+'</div>';
			}
			s += '</div>';
			s += '<div id="points" style="margin:5px;"><b>Points: </b><input type="text" name="points" maxlength="3" size="3"></div>';
			s += '<div id="preview_title" style="margin:5px;"><b>Question Preview:</b></div>';
			s += '<div id="preview_container" style="margin:5px;margin-bottom:15px;"></div>';
		s += '</div>';
		s += '<a id="cancel_details" class="lite_button" style="margin:5px;" href="">Close</a>';
		s += '<a id="edit_details" class="lite_button" style="margin:5px;" href="">Edit</a>';
		s += '<a id="remove_details" class="red_button" style="margin:5px;" href="">Remove</a>';
		s += '<a id="confirm_details" class="lite_button_green" style="margin:5px;" href="">Confirm</a>';
		
		$('#question_modal').append(s);
		$('input[name="points"]').val(window.this_question.question_points);
		admin_editor_builder.build_question_preview($('#preview_container'),JSON.parse(window.this_question.question_data));
		$('#remove_details').click( function(e) {
			e.preventDefault();
			var splice_index = window.question_data.indexOf(window.this_question);
			$('#question_'+window.this_question.question_id).remove();
			window.question_data.splice(splice_index,1);
			admin_editor_builder.updateIndex();
			$('.modal').remove();
		});
		$('#edit_details').click( function(e) {
			e.preventDefault();
			$('#question_modal').empty();
			admin_editor_builder.display_question_editor(window.this_question);
		});
		$('#cancel_details').click( function(e) {
			e.preventDefault();
			$('.modal').remove();
		});
		$('#confirm_details').click( function(e) {
			e.preventDefault();
			window.this_question.question_points = parseInt($('input[name="points"]').val());
			var points_text = 'pts';
			if (window.this_question.question_points == 1) points_text = 'pt';
			$('#layout_table #question_'+window.this_question.question_id+' .td_middle').text(window.this_question.question_points+points_text);
			admin_editor_builder.update_layout_header();
			$('.modal').remove();
		});
    },
    
    display_question_editor: function (question_data) {
    	window.new_question_data = "";
    	if (question_data != null) window.new_question_data = question_data.question_data;
    	var s = '<h3 style="margin-bottom:10px;">Editing Question</h3>';
		s += '<div id="question_editor" style="display:block;width:100%;text-align:left;">';
			s += '<div id="title" style="margin:5px;"><b>Title: </b><input type="text" name="title" maxlength="50" size="25"></div>';
			s += '<div id="tags" style="margin:5px;"><b>Tags: </b>';
			window.current_tags = JSON.parse(question_data.question_tags);
			for (const i in window.current_tags) { 
				s+= '<div class="question_tag">'+window.current_tags[i]+'</div>';
			}
			s += '</div>';
			s += '<div id="type" style="margin:5px;"><b>Editor: </b>';
			s += '<select id="editor_type">';
				s += '<option value="raw">Raw JSON</option>';
				s += '<option value="essay">Essay</option>';
			s += '</select>';
			s += '</div>';
			s += '<div id="editor_title" style="margin:5px;"><b>Question Data:</b></div>';
			s += '<div id="editor">';
			s += '</div>';
		s += '</div>';
		s += '<a id="back_edit" class="lite_button" style="margin:5px;" href="">&larr; Discard</a>';
		s += '<a id="savenew_edit" class="lite_button" style="margin:5px;" href="">Save As New</a>';
		s += '<a id="overwrite_edit" class="lite_button_green" style="margin:5px;" href="">Confirm Changes</a>';
		
		$('#question_modal').append(s);
		$('input[name="title"]').val(question_data.question_title);
		$('#back_edit').click ( function(e) {
			e.preventDefault();
			$('#question_modal').empty();
			admin_editor_builder.display_question_details();
		});
		 $('#editor_type').change( function(e) {
			$('#editor').empty();
			console.log("editor changed.");
			var s = "";
			switch($(this).val()) {
			case "raw":
				s += '<textarea name="content" style="min-height:150px;width:calc(100% - 10px);"></textarea>';
				$('#editor').append(s);
				if (window.new_question_data != null) {
					$('textarea[name="content"]').val(window.new_question_data);
				}
				$('textarea[name="content"]').on('change keyup paste', function() {
					window.new_question_data = $(this).val();
				});
				break;
			case "essay":
				s += '<div id="prompt_title" style="margin:5px;"><b>Prompt:</b></div>';
				s += '<textarea name="prompt" style="min-height:50px;width:calc(100% - 10px);"></textarea>';
				s += '<div id="prompt_title" style="margin:5px;"><b>Include Graphics: </b><input type="checkbox" name="include_graphics"></div>';
				s += '<div id="graphics_options" style="display:none;">';
					s += '<div id="graphics_type_block" style="margin:5px;"><b>Graphics Type: </b><select id="graphics_type">';
						s += '<option value="image">Image</option>';
						s += '<option value="molfile">Molfile</option>';
					s += '</select></div>';
					s += '<div id="graphics_url_title" style="margin:5px;"><b>Graphics URL (relative to "server" directory):</b></div>';
					s += '<input type="text" name="graphics_url" maxlength="75" style="width:calc(100% - 10px);">';
					s += '<div id="maxwidth_title" style="margin:5px;"><b>Max Width:</b></div>';
					s += '<input type="text" name="graphics_maxwidth" maxlength="75" size="5">';
					s += '<div id="maxheight_title" style="margin:5px;"><b>Max Height:</b></div>';
					s += '<input type="text" name="graphics_maxheight" maxlength="75" size="5">';
				s += '</div>';
				$('#editor').append(s);
				$('textarea[name="prompt"]').on('change keyup paste', function() {
					var new_data = {};
					new_data["type"] = "essay";
					new_data["prompt"] = $(this).val();
					if ($('input[name="include_graphics"]').is(':checked')) {
						new_data["graphics_type"] = $('#graphics_type').val();
						if ($('input[name="graphics_url"]').val() != "") new_data["graphics_url"] = $('input[name="graphics_url"]').val();
						if ($('input[name="graphics_maxwidth"]').val() != "") new_data["graphics_maxwidth"] = $('input[name="graphics_maxwidth"]').val();
						if ($('input[name="graphics_maxheight"]').val() != "") new_data["graphics_maxheight"] = $('input[name="graphics_maxheight"]').val();
					}
					window.new_question_data = JSON.stringify(new_data);
				});
				$('input[name="include_graphics"]').click( function() {
					$('#graphics_options').toggle(this.checked);
					$('textarea[name="prompt"]').change();
				});
				$('#graphics_type').change( function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_url"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_maxwidth"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
				$('input[name="graphics_maxheight"]').on('change keyup paste', function () {
					$('textarea[name="prompt"]').change();
				});
			
				var question_object = null;
				if (window.new_question_data != null) {
					try {
						question_object = JSON.parse(window.new_question_data);
					} catch(e) {
						// Invalid JSON.
					}
					if (question_object != null) {
						if (question_object.type == "essay") {
							// Type matches, so fill in the fields.
							$('textarea[name="prompt"]').val(question_object.prompt);
							if (question_object.graphics_type != null) {
								$('#graphics_type').val(question_object.graphics_type);
								$('input[name="graphics_url"]').val(question_object.graphics_url);
								$('input[name="graphics_maxwidth"]').val(question_object.graphics_maxwidth);
								$('input[name="graphics_maxheight"]').val(question_object.graphics_maxheight);
								$('input[name="include_graphics"]').click();
							}
						}
					}
				}
				break;
			default:
				break;
			}
		
		});
		$('#savenew_edit').click( function(e) {
			e.preventDefault();
			// Capture question details, then show confirmation message.
			var new_title = $('input[name="title"]').val();
			var new_tags = JSON.stringify(window.current_tags);
			var new_data = window.new_question_data;
			var edited_question = {
				"question_id"    : parseInt(window.this_question.question_id),
				"question_tags"  : new_tags,
				"question_title" : new_title,
				"question_data"  : new_data
			}
			$('#question_modal').empty();
			var s = '<h3 style="margin-bottom:10px;">Saving As New Question</h3>';
            s += '<h3 style="margin-bottom:10px;">Are you sure?</h3>';
            s += 'Your edits will be saved as a new question in the question bank, and the original question you were modifying will be left as-is. This new question will also take the place of the one you were viewing in your assignment. Please be sure that you have given this new question a unique title, as the process won\'t work if a duplicate title already exists.<br/><br/>';
            s += '<div id="status_block_savenew" style="display:none;font-weight:900;background-color:var(--palette-green);color:white;padding:15px;"></div>';
            s += '<a id="cancel_savenew" class="lite_button" style="margin:5px;" href="">Cancel</a>';
            s += '<a id="confirm_savenew" class="lite_button_green" style="margin:5px;" href="">Confirm</a>';
            s += '<a id="return_savenew" class="lite_button_green" style="margin:5px;display:none;" href="">Return to Details</a>';
            $('#question_modal').append(s);
            $('#cancel_savenew').click( function(e) {
            	e.preventDefault();
            	$('#question_modal').empty();
            	admin_editor_builder.display_question_editor(edited_question);
            });
            $('#confirm_savenew').click( function(e) {
            	e.preventDefault();
            	$('#cancel_savenew').css('display','none');
            	$('#confirm_savenew').css('display','none');
            	$('#status_block_savenew').text('Saving...');
            	$('#status_block_savenew').css('display','block');
            	$.ajax({
            		url: 'admin/question_savenew.php',
            		method: 'POST',
            		data: edited_question,
            		success: function (response) {
            			if (response == "connection_error") {
            				$('#status_block_savenew').text('Error: Could not connect to the database.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            				$('#cancel_savenew').html('&larr; Back');
            			} else if (response == "invalid_access") {
            				$('#status_block_savenew').text('Error: Invalid access.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            				$('#cancel_savenew').html('&larr; Back');
            			} else if (response == "title_exists") {
            				$('#status_block_savenew').text('Error: A question with the same title already exists.');
            				$('#status_block_savenew').css('background-color','var(--palette-red-alert)');
            				$('#cancel_savenew').css('display','inline-block');
            				$('#cancel_savenew').html('&larr; Back');
            			} else {
            				var new_question = JSON.parse(response)[0];
            				// Javascript variable updates
            				var old_id = window.this_question.question_id;
            				window.this_question.question_id = new_question.question_id;
            				window.this_question.question_tags = new_question.question_tags;
            				window.this_question.question_title = new_question.question_title;
            				window.this_question.question_data = new_question.question_data;
            				// Modify the attributes of appropriate block elements in the layout panel
            				$('a#'+old_id).attr('id', window.this_question.question_id);
            				$('#layout_table #question_'+old_id).attr('id', 'question_'+window.this_question.question_id);
            				// Modify the display of those block elements now that their attributes are changed
            				var new_question_title = window.this_question.question_title;
    						if (new_question_title === "") new_question_title = '<i>(no title)</i>';
            				var prefix = $('#layout_table #question_'+window.this_question.question_id+' .td_left').text().split(':')[0];
            				$('#layout_table #question_'+window.this_question.question_id+' .td_left').text(prefix + ": " + new_question_title);
            				var points_text = 'pts';
							if (this_question.question_points == 1) points_text = 'pt';
							$('#layout_table #question_'+window.this_question.question_id+' .td_middle').text(window.this_question.question_points+points_text);
            				$('#status_block_savenew').text('Updating local question bank...');
							$.ajax({
								url: 'admin/load_question_bank.php',
								method: 'POST',
								success: function (response) {
									window.question_bank = JSON.parse(response);
									$('#status_block_savenew').text('Save Successful!');
									$('#return_savenew').css('display','inline-block');
								}
							});
            			}
            		}
            	});
            });
            $('#return_savenew').click( function(e) {
            	e.preventDefault();
            	$('#question_modal').empty();
            	admin_editor_builder.display_question_details();
            });
		});
		$('#overwrite_edit').click( function(e) {
			e.preventDefault();
			// Capture question details, then show confirmation message.
			var new_title = $('input[name="title"]').val();
			var new_tags = JSON.stringify(window.current_tags);
			var new_data = window.new_question_data;
			var edited_question = {
				"question_id"    : parseInt(window.this_question.question_id),
				"question_tags"  : new_tags,
				"question_title" : new_title,
				"question_data"  : new_data
			}
			$('#question_modal').empty();
			var s = '<h3 style="margin-bottom:10px;">Modifying Existing Question</h3>';
            s += '<h3 style="margin-bottom:10px;">Are you sure?</h3>';
            s += 'Your edits will modify an existing question in the question bank, and the changes will be immediately reflected in all assignments (across all class sections) that use this question. If this is not your intention, you can select "Save As New" on the previous screen.<br/><br/>';
            s += '<div id="status_block_overwrite" style="display:none;font-weight:900;background-color:var(--palette-green);color:white;padding:15px;"></div>';
            s += '<a id="cancel_overwrite" class="lite_button" style="margin:5px;" href="">Cancel</a>';
            s += '<a id="confirm_overwrite" class="lite_button_green" style="margin:5px;" href="">Confirm</a>';
            s += '<a id="return_overwrite" class="lite_button_green" style="margin:5px;display:none;" href="">Return to Details</a>';
            $('#question_modal').append(s);
            $('#cancel_overwrite').click( function(e) {
            	e.preventDefault();
            	$('#question_modal').empty();
            	admin_editor_builder.display_question_editor(edited_question);
            });
            $('#confirm_overwrite').click( function(e) {
            	e.preventDefault();
            	$('#cancel_overwrite').css('display','none');
            	$('#confirm_overwrite').css('display','none');
            	$('#status_block_overwrite').text('Saving...');
            	$('#status_block_overwrite').css('display','block');
            	$.ajax({
            		url: 'admin/question_update.php',
            		method: 'POST',
            		data: edited_question,
            		success: function (response) {
            			if (response == "connection_error") {
            				$('#status_block_overwrite').text('Error: Could not connect to the database.');
            				$('#status_block_overwrite').css('background-color','var(--palette-red-alert)');
            				$('#cancel_overwrite').css('display','inline-block');
            				$('#cancel_overwrite').html('&larr; Back');
            			} else if (response == "invalid_access") {
            				$('#status_block_overwrite').text('Error: Invalid access.');
            				$('#status_block_overwrite').css('background-color','var(--palette-red-alert)');
            				$('#cancel_overwrite').css('display','inline-block');
            				$('#cancel_overwrite').html('&larr; Back');
            			} else if (response == "title_exists") {
            				$('#status_block_overwrite').text('Error: A different question with the same title already exists.');
            				$('#status_block_overwrite').css('background-color','var(--palette-red-alert)');
            				$('#cancel_overwrite').css('display','inline-block');
            				$('#cancel_overwrite').html('&larr; Back');
            			} else {
            				var modified_question = JSON.parse(response)[0];
            				// Javascript variable updates
            				window.this_question.question_id = modified_question.question_id;
            				window.this_question.question_tags = modified_question.question_tags;
            				window.this_question.question_title = modified_question.question_title;
            				window.this_question.question_data = modified_question.question_data;
            				// Modify the appropriate block in the layout panel
            				var new_question_title = window.this_question.question_title;
    						if (new_question_title === "") new_question_title = '<i>(no title)</i>';
            				var prefix = $('#layout_table #question_'+window.this_question.question_id+' .td_left').text().split(':')[0];
            				$('#layout_table #question_'+window.this_question.question_id+' .td_left').text(prefix + ": " + new_question_title);
            				var points_text = 'pts';
							if (window.this_question.question_points == 1) points_text = 'pt';
							$('#layout_table #question_'+window.this_question.question_id+' .td_middle').text(window.this_question.question_points+points_text);
            				$('#status_block_overwrite').text('Updating local question bank...');
							$.ajax({
								url: 'admin/load_question_bank.php',
								method: 'POST',
								success: function (response) {
									window.question_bank = JSON.parse(response);
									$('#status_block_overwrite').text('Save Successful!');
									$('#return_overwrite').css('display','inline-block');
								}
							});
            			}
            		}
            	});
            });
            $('#return_overwrite').click( function(e) {
            	e.preventDefault();
            	$('#question_modal').empty();
            	admin_editor_builder.display_question_details();
            });
		});
		$('#editor_type').change();
    },
    
    build_question_cell: function (parent, question_data) {
    	var question_title = question_data.question_title;
    	if (question_title === "") question_title = '<i>(no title)</i>';
    	var points_text = 'pts';
    	if (question_data.question_points == 1) points_text = 'pt';
    	var s = '<tr id="question_'+question_data.question_id+'">';
    	s += '<td class="td_left">Question '+question_data.question_index+': '+question_title+'</td>';
    	s += '<td class="td_middle">'+question_data.question_points+points_text+'</td>';
    	s += '<td class="td_right"><a id="'+question_data.question_id+'" class="lite_button question_details" href="">Details</a></td>';
    	s += '</tr>';
    	parent.append(s);
    	$('a#'+question_data.question_id).click( function(e) {
        	e.preventDefault();
        	$('body').append('<div class="modal"></div>');
			$('.modal').append('<div id="question_modal" class="modal_content"></div>');
        	window.this_question = window.question_data.filter(e => e.question_id == $(this).attr('id'))[0];
        	admin_editor_builder.display_question_details();
        });
    },
    
    build_question_preview: function(parent, question_data) {
    	var s = '';
    	switch (question_data.type) {
    	case 'essay':
    		s += question_data.prompt;
			s += '<br/><br/><i>(essay response box)</i>';    		
    		break;
    	default:
    		s += 'Question type "'+question_data.type+'" has not been implemented.';
    		break;
    	}
    	parent.append(s);
    },
    
    update_layout_header: function () {
    	var total_points = 0;
    	if (window.question_data.length > 0) {
    		for (var i=0; i<window.question_data.length;i++) {
    			total_points = total_points + window.question_data[i].question_points;
    		}
    	}
    	var points_text = 'pts';
    	if (total_points == 1) points_text = 'pt';
    	$('#layout_header').html('Questions: '+window.question_data.length+' ('+total_points+points_text+')');
    },
    
    fixHelperModified: function(e, tr) {
            var $originals = tr.children();
            var $helper = tr.clone();
            $helper.children().each(function(index) {
                $(this).width($originals.eq(index).width())
            });
            return $helper;
    },
    
    updateIndex: function (e, ui) {
        //$('td.td_left', ui.item.parent()).each(function (i) {
        $('td.td_left').each(function (i) {
        	var title = $(this).html().split(':').slice(1).join(':');
            $(this).html('Question '+(i+1)+': '+title);
            var matching_object = window.question_data.filter(e => e.question_id == $(this).parent().attr('id').split('_')[1])[0]
            matching_object.question_index = i+1;
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