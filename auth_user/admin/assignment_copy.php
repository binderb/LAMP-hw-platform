<?php
    
    session_start();
    
    $assignment_id = isset($_POST["assignment_id"]) ? $_POST["assignment_id"] : "";
    $assignment_name = isset($_POST["assignment_name"]) ? $_POST["assignment_name"] : "";
    $destination_id = isset($_POST["destination_id"]) ? $_POST["destination_id"] : "";
    $created_timestamp = isset($_POST["created_timestamp"]) ? $_POST["created_timestamp"] : "";
    $class_id = isset($_POST["class_id"]) ? $_POST["class_id"] : "";
    
    if ($assignment_id == "" || $assignment_name == "" || $destination_id == "" || $created_timestamp == "" || $class_id == "") {
    	echo "Values:";
    	echo "<br/>";
    	echo $assignment_id;
    	echo "<br/>";
    	echo $assignment_name;
    	echo "<br/>";
    	echo $destination_id;
    	echo "<br/>";
    	echo $created_timestamp;
    	echo "<br/>";
    	echo $class_id;
    	echo "<br/>";
        echo "Error: Invalid Access.";
        exit();
    }
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Copy the appropriate assignment row
    $copy_assignment_row = "INSERT INTO assignment_table (class_id, name, created, available, due) SELECT ?, ?, ?, available, due FROM assignment_table WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($copy_assignment_row)) {
    	$stmt->bind_param("issi",$destination_id,$assignment_name,$created_timestamp,$assignment_id);
        $stmt->execute();
        $stmt->store_result();
        $inserted_id = $stmt->insert_id;
    } else {
        echo "There was an error connecting to the database when inserting the assignment row.";
        exit();
    }
    $stmt->close();
    
    // Copy the assignment_questions relationships.
    $copy_assignment_questions = "INSERT INTO assignment_questions (assignment_id, question_id, question_index, question_points) SELECT ?, question_id, question_index, question_points FROM assignment_questions WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($copy_assignment_questions)) {
    	$stmt->bind_param("ii",$inserted_id,$assignment_id);
        $stmt->execute();
    } else {
        echo "There was an error connecting to the database when duplicating the assignment-question relationships.";
        exit();
    }
    $stmt->close();
    
    // Get a list of all user_ids currently associated with the course.
    $get_class_users = "SELECT user_id FROM user_table WHERE class_id = ?";
    if ($stmt = $conn->prepare($get_class_users)) {
        $stmt->bind_param("i", $destination_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $class_users = array();
        while ($row = $result->fetch_assoc())  {
            $class_users[] = $row;
        }
    } else {
        echo 'There was an error connecting to the database when getting the list of users in the class section.';
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
        echo 'There was an error connecting to the database when getting the list of question indices.';
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
    
    echo "copy_success";

?>