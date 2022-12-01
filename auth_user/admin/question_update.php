<?php
    
    session_start();
    
    $question_id = isset($_POST["question_id"]) ? $_POST["question_id"] : "";
    $question_tags = isset($_POST["question_tags"]) ? $_POST["question_tags"] : "";
    $question_title = isset($_POST["question_title"]) ? $_POST["question_title"] : "";
    $question_data = isset($_POST["question_data"]) ? $_POST["question_data"] : "";
    
    if ($question_id == "" || $question_tags == "" || $question_data == "") {
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
    
    // First, check for duplicate titles
    $fetch_data = "SELECT * FROM question_table WHERE question_title = ? AND question_id != ?";
    if ($stmt = $conn->prepare($fetch_data)) {
    	$stmt->bind_param("si",$question_title,$question_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $duplicate_data = array();
        while ($row = $result->fetch_assoc())  $duplicate_data[] = $row;
    } else {
        echo "connection_error";
        exit();
    }
    $stmt->close();
    
    if (count($duplicate_data) > 0) {
    	echo "title_exists";
    	exit();
    } else {
    	// Update the question.
		$update_question = "UPDATE question_table SET question_tags = ?, question_title = ?, question_data = ? WHERE question_id = ?";
		if ($stmt = $conn->prepare($update_question)) {
			$stmt->bind_param("sssi",$question_tags,$question_title,$question_data,$question_id);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
	
	
		// Select the created question and return it to the user.
		$fetch_data = "SELECT * FROM question_table WHERE question_id = ?";
		if ($stmt = $conn->prepare($fetch_data)) {
			$stmt->bind_param("i",$question_id);
			$stmt->execute();
			$result = $stmt->get_result();
			$question_data = array();
			while ($row = $result->fetch_assoc())  $question_data[] = $row;
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
		
		echo json_encode($question_data);
    
    }
    
    
    $conn->close();
    

?>