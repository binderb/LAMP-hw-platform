<?php
    
    session_start();
    
    $assignment_data = isset($_POST["assignment_data"]) ? $_POST["assignment_data"] : "";
    $response_data = isset($_POST["response_data"]) ? $_POST["response_data"] : "";
    $user_id = $_SESSION['user_id'];
    //$assignment_data = json_decode($assignment_data);
    //$class_data = json_decode($class_data);
    
    if ($assignment_data == "" || $response_data == "") {
        echo "invalid_access";
        exit();
    }
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Get due date from the server.
    // (Don't necessarily trust the POSTed assignment_data. This is not totally fool-proof but it's better than nothing.)
    $get_due_date = "SELECT due FROM assignment_table WHERE assignment_id = ?";
	if ($stmt = $conn->prepare($get_due_date)) {
		$stmt->bind_param("i",$assignment_data["assignment_id"]);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($due_date_string);
		$stmt->fetch();
	} else {
		echo "Could not save changes (database error). Try again, but let your instructor know you got this message!";
		exit();
	}
	$stmt->close();
	// Also need to see if the user has an extension, and modify the loaded due date if so.
	$get_extension_data = "SELECT extensions FROM assignment_table WHERE assignment_id = ?";
	if ($stmt = $conn->prepare($get_extension_data)) {
		$stmt->bind_param("i", $assignment_data["assignment_id"]);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($extension_data);
		$stmt->fetch();
	} else {
		echo "connection_error";
	}
	$stmt->close(); 
	$extension_array = json_decode('{}');
	if ($extension_data != "") $extension_array = json_decode($extension_data);
 	if (property_exists($extension_array,$user_id)) {
 		$due_date_string = $extension_array->$user_id;
 	}
	$due_date = strtotime($due_date_string);
	$now = time();
	
	if ($now > $due_date) {
		echo "Changes could not be saved because the assignment deadline has passed.";
		exit();
	}
    
    	
	// Update the appropriate rows in score_table.
	for ($i = 0; $i < count($response_data); $i++) {
		$update_response = "UPDATE response_table SET response_data = ? WHERE assignment_id = ? AND user_id = ? AND question_index = ?";
		if ($stmt = $conn->prepare($update_response)) {
			$question_index_i = intval($response_data[$i]["question_index"]);
			$stmt->bind_param("siii",$response_data[$i]["response_data"],$assignment_data["assignment_id"],$_SESSION['user_id'],$question_index_i);
			$stmt->execute();
		} else {
			echo "Could not save changes (database error). Try again, but let your instructor know you got this message!";
			exit();
		}
		$stmt->close();
	}
    	
	$conn->close();
	
	echo "update_success";
	exit();

?>