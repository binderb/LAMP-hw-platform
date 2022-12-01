<?php
    
    session_start();
    
    $assignment_id = isset($_POST["assignment_id"]) ? $_POST["assignment_id"] : "";
    $class_id = isset($_POST["class_id"]) ? $_POST["class_id"] : "";
    $name = isset($_POST["name"]) ? $_POST["name"] : "";
    $created = isset($_POST["created"]) ? $_POST["created"] : "";
    $available = isset($_POST["available"]) ? $_POST["available"] : "";
    $due = isset($_POST["due"]) ? $_POST["due"] : "";
    $graded = isset($_POST["graded"]) ? $_POST["graded"] : "";
    $extensions = isset($_POST["extensions"]) ? $_POST["extensions"] : "";
    $question_data = isset($_POST["question_data"]) ? $_POST["question_data"] : "";
    $question_data = json_decode($question_data);
    
    if ($assignment_id == "" || $class_id == "" || $name == "" || $created == "" || $available == "" || $due == "" || $graded == "") {
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
    
    if ($assignment_id == -1) {
    	// This is a new assignment.
    	
    	// Add the appropriate row to assignments_table.
    	$add_assignment_row = "INSERT INTO assignment_table (class_id, name, created, available, due) VALUES (?, ?, ?, ?, ?)";
		if ($stmt = $conn->prepare($add_assignment_row)) {
			$stmt->bind_param("issss",$class_id,$name,$created,$available,$due);
			$stmt->execute();
			$stmt->store_result();
			$inserted_id = $stmt->insert_id;
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
    	
    	// Add the appropriate rows to assignment_questions.
    	for ($i = 0; $i < count($question_data); $i++) {
    		$add_aq_row = "INSERT INTO assignment_questions (assignment_id, question_id, question_index, question_points) VALUES (?, ?, ?, ?)";
			if ($stmt = $conn->prepare($add_aq_row)) {
				$stmt->bind_param("iiii",$inserted_id,$question_data[$i]->question_id,$question_data[$i]->question_index,$question_data[$i]->question_points);
				$stmt->execute();
			} else {
				echo "connection_error";
				exit();
			}
			$stmt->close();
    	}
    	
    	// Get a list of all user_ids currently associated with the course.
		$get_class_users = "SELECT user_id FROM user_table WHERE class_id = ?";
		if ($stmt = $conn->prepare($get_class_users)) {
			$stmt->bind_param("i", $class_id);
			$stmt->execute();
			$result = $stmt->get_result();
			$class_users = array();
			while ($row = $result->fetch_assoc())  {
				$class_users[] = $row;
			}
		} else {
			echo 'connection_error';
			exit();
		}
		$stmt->close();
	
		// Get a list of question index values associated with the assignment.
		$get_question_indices = "SELECT question_index FROM assignment_questions WHERE assignment_id = ?";
		if ($stmt = $conn->prepare($get_question_indices)) {
			$stmt->bind_param("i", $inserted_id);
			$stmt->execute();
			$result = $stmt->get_result();
			$question_indices = array();
			while ($row = $result->fetch_assoc())  {
				$question_indices[] = $row;
			}
		} else {
			echo 'connection_error';
			exit();
		}
		$stmt->close();
	
		// Create blank rows in response_table and score_table for each student.
		$blank_response = "{}";
		for ($i = 0; $i < count($class_users); $i++) {
			for ($j = 0; $j < count($question_indices); $j++) {
				$add_response_row = "INSERT INTO response_table (assignment_id, question_index, user_id, response_data) VALUES (?, ?, ?, ?)";
				if ($stmt = $conn->prepare($add_response_row)) {
					$stmt->bind_param("iiis",$inserted_id,$question_indices[$j]['question_index'],$class_users[$i]['user_id'],$blank_response);
					$stmt->execute();
				} else {
					echo "connection_error";
					exit();
				}
				$stmt->close();
				$add_score_row = "INSERT INTO score_table (assignment_id, question_index, user_id) VALUES (?, ?, ?)";
				if ($stmt = $conn->prepare($add_score_row)) {
					$stmt->bind_param("iii",$inserted_id,$question_indices[$j]['question_index'],$class_users[$i]['user_id']);
					$stmt->execute();
				} else {
					echo "connection_error";
					exit();
				}
				$stmt->close();
			}
		}
    	
    	
    	$conn->close();
    	
    	echo $inserted_id;
    	exit();
    	
    } else {
    	// This is an existing assignment.
    	
    	// Update the appropriate row in assignments_table.
    	$update_assignment_row = "UPDATE assignment_table SET name = ?, available = ?, due = ? WHERE assignment_id = ?";
		if ($stmt = $conn->prepare($update_assignment_row)) {
			$stmt->bind_param("sssi",$name,$available,$due,$assignment_id);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
    	
    	// Delete all existing rows in assignment_questions, response_table, and score_table that reference this assignment.
    	$delete_aq_rows = "DELETE FROM assignment_questions WHERE assignment_id = ?";
    	if ($stmt = $conn->prepare($delete_aq_rows)) {
			$stmt->bind_param("i",$assignment_id);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
    	$delete_response_rows = "DELETE FROM response_table WHERE assignment_id = ?";
    	if ($stmt = $conn->prepare($delete_response_rows)) {
			$stmt->bind_param("i",$assignment_id);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
    	$delete_score_rows = "DELETE FROM score_table WHERE assignment_id = ?";
    	if ($stmt = $conn->prepare($delete_score_rows)) {
			$stmt->bind_param("i",$assignment_id);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
    	
    	// Add new rows to assignment_questions reflecting the updated layout.
    	for ($i = 0; $i < count($question_data); $i++) {
    		$add_aq_row = "INSERT INTO assignment_questions (assignment_id, question_id, question_index, question_points) VALUES (?, ?, ?, ?)";
			if ($stmt = $conn->prepare($add_aq_row)) {
				$stmt->bind_param("iiii",$assignment_id,$question_data[$i]->question_id,$question_data[$i]->question_index,$question_data[$i]->question_points);
				$stmt->execute();
			} else {
				echo "connection_error";
				exit();
			}
			$stmt->close();
    	}
    	
    	// Get a list of all user_ids currently associated with the course.
		$get_class_users = "SELECT user_id FROM user_table WHERE class_id = ?";
		if ($stmt = $conn->prepare($get_class_users)) {
			$stmt->bind_param("i", $class_id);
			$stmt->execute();
			$result = $stmt->get_result();
			$class_users = array();
			while ($row = $result->fetch_assoc())  {
				$class_users[] = $row;
			}
		} else {
			echo 'connection_error';
			exit();
		}
		$stmt->close();
	
		// Get a list of question index values associated with the assignment.
		$get_question_indices = "SELECT question_index FROM assignment_questions WHERE assignment_id = ?";
		if ($stmt = $conn->prepare($get_question_indices)) {
			$stmt->bind_param("i", $assignment_id);
			$stmt->execute();
			$result = $stmt->get_result();
			$question_indices = array();
			while ($row = $result->fetch_assoc())  {
				$question_indices[] = $row;
			}
		} else {
			echo 'connection_error';
			exit();
		}
		$stmt->close();
	
		// Create blank rows in response_table and score_table for each student.
		$blank_response = "{}";
		for ($i = 0; $i < count($class_users); $i++) {
			for ($j = 0; $j < count($question_indices); $j++) {
				$add_response_row = "INSERT INTO response_table (assignment_id, question_index, user_id, response_data) VALUES (?, ?, ?, ?)";
				if ($stmt = $conn->prepare($add_response_row)) {
					$stmt->bind_param("iiis",$assignment_id,$question_indices[$j]['question_index'],$class_users[$i]['user_id'],$blank_response);
					$stmt->execute();
				} else {
					echo "connection_error";
					exit();
				}
				$stmt->close();
				$add_score_row = "INSERT INTO score_table (assignment_id, question_index, user_id) VALUES (?, ?, ?)";
				if ($stmt = $conn->prepare($add_score_row)) {
					$stmt->bind_param("iii",$assignment_id,$question_indices[$j]['question_index'],$class_users[$i]['user_id']);
					$stmt->execute();
				} else {
					echo "connection_error";
					exit();
				}
				$stmt->close();
			}
		}
    	
    	$conn->close();
    	
    	echo $assignment_id;
    	exit();
    	
    }

?>