<!DOCTYPE html>
<html>
<head>
	<title>Reset Password</title>
	<?php include("headers.php"); ?>
	<?php include('../auth_user/admin/load_class_data.php'); ?>
</head>
<body>
    <img class="title_badge" style="margin-top:20px;" src="" width="150" height="150" />
    <h1 id="title">Homework Login</h1>
    <div id="responseblock" style="display:none;"></div>
    <div id="container">
	<form id="reset_form" class="login_block">
		<h3 style="margin-bottom:15px;">Password Reset</h3>
		Please enter your school email below, along with your new desired password.<br/>Passwords must be at least 8 characters long.
		<div id="fields">
			<p>School Email:</p> <input type="text" name="email">
			<p>New Password:</p> <input type="password" name="pswd"><br/>
			<p>Re-type New Password:</p> <input type="password" name="pswd2"><br/>
		</div>
		<a id="reset_submit" class="lite_button_green" href="" style="margin:5px;">Submit</a>
	</form>
	</div>
    <?php include("small_footer.php"); ?>
    <script type="text/javascript">
		$('#reset_submit').click(function(e) {
			e.preventDefault();
			$('#reset_form').submit();
		});
		$("#reset_form").submit(function(e) {
			e.preventDefault();
			var errors = "";
			if ($("input[name=email]").val() == "") errors += "<br/>\u2014 Please provide the email address associated with your account.";
			if ($("input[name=pswd]").val() == "" || $("input[name=pswd]").val().length < 8) errors += "<br/>\u2014 Please provide a password with at least 8 characters.";
			if ($("input[name=pswd]").val() != "" && $("input[name=pswd]").val() != $("input[name=pswd2]").val()) errors += "<br/>\u2014 Passwords do not match.";
			$("#responseblock").css("display","inline-block");
			if (errors != "") {
				$("#responseblock").css("background-color","#f3645a");
				$("#responseblock").css("padding","15px");
				$("#responseblock").html("<b>Invalid Entry:</b></span><br/>"+errors);
			} else {
				$("#responseblock").css("background-color","#60b369");
				$("#responseblock").css("padding","15px");
				$("#responseblock").html("<b>Working...</b>");
				$.post("reset_password.php", $("#reset_form").serialize(), function(data) {
					if (data == "email_match_fail") {
						$("#responseblock").css("background-color","#f3645a");
						$("#responseblock").css("padding","15px");
						$("#responseblock").html("<b>Error:</b><br/>Provided email does not match the one tied to this reset link.");
					} else {
						window.location = './auth_response.php?result='+data;   
					}
				});
			}
		});
	</script>
</body>
</html>