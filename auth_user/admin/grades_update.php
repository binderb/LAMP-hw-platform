<?php
    
    session_start();
    
    $assignment_data = isset($_POST["assignment_data"]) ? $_POST["assignment_data"] : "";
    $class_data = isset($_POST["class_data"]) ? $_POST["class_data"] : "";
    //$assignment_data = json_decode($assignment_data);
    //$class_data = json_decode($class_data);
    
    
    if ($assignment_data == "" || $class_data == "") {
        echo "invalid_access";
        echo "<br/>";
        echo $assignment_data;
        echo "<br/>";
        echo $class_data;
        
        exit();
    }
    
//     echo var_dump($class_data[0]["user_id"]);
//     echo var_dump($class_data[0]["question_index"]);
//     echo var_dump($class_data[0]["score"]);
//     echo var_dump($assignment_data["assignment_id"]);
    
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    	
	// Update the appropriate rows in score_table.
	for ($i = 0; $i < count($class_data); $i++) {
		$score_i = floatval($class_data[$i]["score"]);
	
		$add_score_row = "UPDATE score_table SET score = ?, feedback_data = ? WHERE assignment_id = ? AND user_id = ? AND question_index = ?";
		if ($stmt = $conn->prepare($add_score_row)) {
			$stmt->bind_param("dsiii",$score_i,$class_data[$i]["feedback_data"],$assignment_data["assignment_id"],$class_data[$i]["user_id"],$class_data[$i]["question_index"]);
			$stmt->execute();
		} else {
			echo "connection_error";
			exit();
		}
		$stmt->close();
	}
    	
	$conn->close();
	
	echo "update_success";
	exit();

?>