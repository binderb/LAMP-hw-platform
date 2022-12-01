<?php

	// The admin version of this function just gets a full list of assignments out of the assignment_table.
	// This version only retrieves assignments that pertain to the logged-in user, and they must be a student or dev.
	session_start();

	use Dotenv\Dotenv;
	require '../vendor/autoload.php';
	$dotenv = Dotenv::createImmutable('..');
	$dotenv->load();
	
	if (!isset($_SESSION['user_id']) || !isset($_SESSION['class_id']) || ($_SESSION['access'] != 'student' && $_SESSION['access'] != 'dev')) {
		echo 'invalid_access';
		exit();
	}
	
	$user_id = $_SESSION['user_id'];
    

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Get all data in assignment table
    $fetch_data = "SELECT * FROM assignment_table WHERE class_id = ?";
    if ($stmt = $conn->prepare($fetch_data)) {
    	$stmt->bind_param("i",$_SESSION['class_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $assignment_data = array();
        while ($row = $result->fetch_assoc())  $assignment_data[] = $row;
    } else {
        echo 'connection_error';
        exit();
    }
    $stmt->close();
    // Also need to see if the user has an extension for each assignment, and modify the loaded due date if so.
    for ($i = 0; $i < count($assignment_data); $i++) {
    	$assignment_id_i = $assignment_data[$i]["assignment_id"];
		$get_extension_data = "SELECT extensions FROM assignment_table WHERE assignment_id = ?";
		if ($stmt = $conn->prepare($get_extension_data)) {
			$stmt->bind_param("i", $assignment_id_i);
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
			$assignment_data[$i]["due"] = $extension_array->$user_id;
			// Add an extra "extended" flag for visualization on the student side.
			$assignment_data[$i]["extended"] = 1;
		}
	}
    $conn->close();
    echo json_encode($assignment_data);

?>