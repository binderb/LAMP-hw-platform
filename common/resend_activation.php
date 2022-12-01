<?php
    session_start();
    $user_id = isset($_SESSION["resend_activation_id"]) ? $_SESSION["resend_activation_id"] : "";
    session_destroy();
    
    if ($user_id == "") {
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
	$new_activation_key = md5($user_id + time());
	$new_activation_timestamp = time();
	
	$get_user_email = "SELECT email FROM user_table WHERE user_id = ?";
	if ($stmt = $conn->prepare($get_user_email)) {
		$stmt->bind_param("i",$user_id);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($userEmail);
		$stmt->fetch();
	} else {
		echo "connection_error";
		exit();
	}
	if ($user_id != "") {
	
		// Get name of class section for the delivery email
		$get_class_name = "SELECT b.name FROM user_table a JOIN class_table b ON (a.class_id = b.class_id) WHERE a.user_id = ?";
		if ($stmt = $conn->prepare($get_class_name)) {
			$stmt->bind_param("i",$user_id);
			$stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($class_name);
			$stmt->fetch();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
	
	
		$store_activation_key = "INSERT INTO activation_keys (user_id,key_string,key_timestamp) VALUES (?,?,?)";
		if ($stmt = $conn->prepare($store_activation_key)) {
			$stmt->bind_param("iss", $user_id,$new_activation_key,$new_activation_timestamp);
			$stmt->execute();
	
			// Compose email with activation link to provided email address
			$to      = $userEmail;
			$subject = "New " . $class_name . " Activation Link";
			$message = "You are receiving this email because you requested a fresh activation link for your ".$class_name." profile. Activate your profile by following the link below:<br/><br/>".
					   $_ENV["APP_ROOT"]."/common/activate.php?key=".$new_activation_key."<br/><br/>".
					   "After activating your profile, you should be able to log in successfully. ".
					   "Please let your instructor know if you have any issues with this! Email them directly, rather than responding to this email; this message is an automated response sent by the server. <b>The provided link will expire in 24 hours!</b><br/><br/>".
					   "If you did not request this message and believe it was sent in error, let your instructor know!<br/><br/>";
			$headers[] = 'From: ' . $_ENV["SITE_NOREPLY_EMAIL_NAME"] . ' ' . $_ENV["SITE_NOREPLY_EMAIL_ADDRESS"];
			$headers[] = 'X-Mailer: PHP/' . phpversion();
			$headers[] = 'MIME-Version: 1.0';
			$headers[] = 'Content-type: text/html; charset=iso-8859-1';
			$mail_status = mail($to, $subject, $message, implode("\r\n", $headers));
			echo "resend_activation_success";
		} else {
			echo "connection_error";
			exit();
		}
	} else {
		echo "connection_error";
		exit();
	}
	
	// Close connection
	$conn->close();
    
?>