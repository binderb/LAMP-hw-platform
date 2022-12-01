<?php

    $email = isset($_POST["email"]) ? $_POST["email"] : "";
    $uname = isset($_POST["uname"]) ? $_POST["uname"] : "";
    $fname = isset($_POST["fname"]) ? $_POST["fname"] : "";
    $lname = isset($_POST["lname"]) ? $_POST["lname"] : "";
    $pswd = isset($_POST["pswd"]) ? password_hash($_POST["pswd"],PASSWORD_DEFAULT) : "";
    $class_id = isset($_POST["class"]) ? $_POST["class"] : "";
    
    if ($email == "" || $uname == "" || $fname == "" || $lname == "" || $pswd == "" || $class = "") {
        echo "invalid_access_nologin";
        exit();
    }
    
    $access = "student";
    $active = 0;
    $activation_key = md5($uname + time());
    $activation_timestamp = time();
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    
    // Check if email or username exists in the selected class already
    $email_exists_check = "SELECT email FROM user_table WHERE email = ? AND class_id = ?";
    if ($stmt = $conn->prepare($email_exists_check)) {
        $stmt->bind_param("si",$email,$class_id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows() > 0) { 
            echo "email_exists";
            exit();
        }
    } else {
        echo "connection_error";
        exit();
    }
    $stmt->close();
    $username_exists_check = "SELECT username FROM user_table WHERE username = ?";
    if ($stmt = $conn->prepare($username_exists_check)) {
        $stmt->bind_param("si",$uname,$class_id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows() > 0) { 
            echo "username_exists";
            exit();
        }
    } else {
        echo "connection_error";
        exit();
    }
    $stmt->close();
    
    // Add row to users table, with an inactive flag on the account
    $create_user_row = "INSERT INTO user_table (email, username, first, last, class_id, pswd, access, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $user_id = -1;
    if ($stmt = $conn->prepare($create_user_row)) {
        $stmt->bind_param("ssssissi", $email,$uname,$fname,$lname,$class_id,$pswd,$access,$active);
        $stmt->execute();
        $user_id = $conn->insert_id;
    } else {
        echo "connection_error";
        exit();
    }
    if ($user_id != -1) {
    
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
		
		// Need to generate blank rows in response_table and score_table
		// for any assignments that already exist in this class section.
		
		// Retrieve a list of assignments and questions currently associated with the class section.
		$get_rows_to_add = "SELECT a.assignment_id, b.question_index FROM assignment_table a JOIN assignment_questions b ON (a.assignment_id = b.assignment_id AND a.class_id = ?)";
        if ($stmt = $conn->prepare($get_rows_to_add)) {
            $stmt->bind_param("i", $class_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $rows_to_add = array();
            while ($row = $result->fetch_assoc())  {
	            $rows_to_add[] = $row;
            }
        } else {
			echo "connection_error";
			exit();
        }
        $stmt->close();
        
        // Add blank rows to response_table and score_table.
        $blank_response = "{}";
        for ($i = 0; $i < count($rows_to_add); $i++) {
    		$add_response_row = "INSERT INTO response_table (assignment_id, question_index, user_id, response_data) VALUES (?, ?, ?, ?)";
			if ($stmt = $conn->prepare($add_response_row)) {
				$stmt->bind_param("iiis",$rows_to_add[$i]['assignment_id'],$rows_to_add[$i]['question_index'],$user_id,$blank_response);
				$stmt->execute();
			} else {
				echo "connection_error";
				exit();
			}
			$stmt->close();
			$add_score_row = "INSERT INTO score_table (assignment_id, question_index, user_id) VALUES (?, ?, ?)";
			if ($stmt = $conn->prepare($add_score_row)) {
				$stmt->bind_param("iii",$rows_to_add[$i]['assignment_id'],$rows_to_add[$i]['question_index'],$user_id);
				$stmt->execute();
			} else {
				echo "connection_error";
				exit();
			}
			$stmt->close();
    	}
		
        // Store activation key
        $store_activation_key = "INSERT INTO activation_keys (user_id ,key_string, key_timestamp) VALUES (?,?,?)";
        if ($stmt = $conn->prepare($store_activation_key)) {
            $stmt->bind_param("iss", $user_id,$activation_key,$activation_timestamp);
            $stmt->execute();
        } else {
            echo "connection_error";
            exit();
        }
        
        // Compose email with activation link to provided email address
		$to      = $email;
		$subject = $class_name . " Profile Created!";
		$message = "Thanks for creating a profile for ". $class_name ."! Activate your profile by following the link below:<br/><br/>".
				   $_ENV["APP_ROOT"]."/common/activate.php?key=".$activation_key."<br/><br/>".
				   "After activating your profile, you should be able to log in successfully using the password you set. ".
				   "Please let your instructor know if you have any issues with this! Email him directly, rather than responding to this email; this message is an automated response sent by the server. <b>The provided link will expire in 24 hours!</b>";
        $headers[] = 'From: ' . $_ENV["SITE_NOREPLY_EMAIL_NAME"] . ' ' . $_ENV["SITE_NOREPLY_EMAIL_ADDRESS"];
		$headers[] = 'X-Mailer: PHP/' . phpversion();
		$headers[] = 'MIME-Version: 1.0';
		$headers[] = 'Content-type: text/html; charset=iso-8859-1';
		mail($to, $subject, $message, implode("\r\n", $headers));
		echo "creation_success";
		
    }
    $stmt->close();
    $conn->close();

?>
