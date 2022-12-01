<?php

    $link_email = isset($_POST["email"]) ? $_POST["email"] : "";
    $class_id = isset($_POST["class"]) ? $_POST["class"] : "";
    
    if ($link_email == "" || $class_id == "") {
    	echo "invalid_access_nologin";
    	exit();
    }
        
	use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
	$conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
	$conn->set_charset("utf8");

	$userEmail = "";
	$reset_key = md5($username + time());
	$reset_timestamp = time();
	
	// Retrieve user_id by checking against provided email address.
	$check_user_email = "SELECT email, user_id FROM user_table WHERE email = ? AND class_id = ?";
	if ($stmt = $conn->prepare($check_user_email)) {
		$stmt->bind_param("si",$link_email,$class_id);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($userEmail,$user_id);
		$stmt->fetch();
	} else {
		echo "connection_error";
		exit();
	}
	
	if ($userEmail == "") {
		echo "email_not_registered";
		exit();
	}
	
	// Get name of class section for the delivery email
	$get_class_name = "SELECT name FROM class_table WHERE class_id = ?";
	if ($stmt = $conn->prepare($get_class_name)) {
		$stmt->bind_param("i",$class_id);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($class_name);
		$stmt->fetch();
	} else {
		echo "connection_error";
		exit();
	}
	$stmt->close();

	$store_reset_key = "INSERT INTO password_reset_keys (user_id,key_string,key_timestamp) VALUES (?,?,?)";
	if ($stmt = $conn->prepare($store_reset_key)) {
		$stmt->bind_param("iss", $user_id,$reset_key,$reset_timestamp);
		$stmt->execute();
	} else {
		echo "connection_error";
	}
	
	// Compose email with activation link to provided email address
	$to      = $userEmail;
	$subject = $class_name . " Password Reset Link";
	$message = "You are receiving this email because you requested a password reset link for your ".$class_name." profile. Reset your password by following the link below:<br/><br/>".
			   $_ENV["APP_ROOT"]."/common/reset_access.php?key=".$reset_key."<br/><br/>".
			   "Please let your instructor know if you have any issues with this! Email them directly, rather than responding to this email; this message is an automated response sent by the server. <b>The provided link will expire in 24 hours!</b><br/><br/>".
			   "If you did not request this message and believe it was sent in error, let your instructor know!<br/>";
	$headers[] = 'From: ' . $_ENV["SITE_NOREPLY_EMAIL_NAME"] . ' ' . $_ENV["SITE_NOREPLY_EMAIL_ADDRESS"];
	$headers[] = 'X-Mailer: PHP/' . phpversion();
	$headers[] = 'MIME-Version: 1.0';
	$headers[] = 'Content-type: text/html; charset=iso-8859-1';
	$mail_status = mail($to, $subject, $message, implode("\r\n", $headers));
	echo "send_reset_success";
	
	// Close connection
	$conn->close();
    
?>