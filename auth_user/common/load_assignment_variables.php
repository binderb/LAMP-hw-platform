<?php
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
    
    echo '<script type="text/javascript">';
    
    if (!isset($_SESSION["access"]) || ($_SESSION["access"] != "admin" && $_SESSION["access"] != "student" && $_SESSION["access"] != "dev")) {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access");';
        echo '</script>';
        exit();
    }
    $assignment_id = isset($_POST["id"]) ? $_POST["id"] : "";
    $class_id = isset($_POST["class"]) ? $_POST["class"] : "";
    if ($assignment_id == "") {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access");';
        echo '</script>';
        exit();
    }
    
    if ($assignment_id != -1) {
        // Client is requesting data for an existing assignment; look it up in the database.
        echo 'window.loaded_assignment_id = '.$assignment_id.';';

        // Attempt MySQL server connection.
        $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
        $conn->set_charset("utf8");
    
        // Retrieve global data from assignment_table and assign variables.
        $get_global_assignment_data = "SELECT * FROM assignment_table WHERE assignment_id = ?";
        if ($stmt = $conn->prepare($get_global_assignment_data)) {
            $stmt->bind_param("i", $assignment_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $global_data = array();
            while ($row = $result->fetch_assoc())  {
	            $global_data[] = $row;
            }
            if (count($global_data) > 0) {
                echo 'window.assignment_data = '.json_encode($global_data[0]).';';
            } else {
                echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=assignment_not_found");';
                echo '</script>';
                exit();
            }
        } else {
            echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error");';
            echo '</script>';
            exit();
        }
        $stmt->close();
    
        // Retrieve question data from joined (assignment_questions + question_table) and assign variables.
        $get_question_data = "SELECT a.question_index,a.question_points,b.question_id,b.question_tags,b.question_title,b.question_data FROM assignment_questions a JOIN question_table b ON a.question_id = b.question_id WHERE a.assignment_id = ? ORDER BY a.question_index";
        if ($stmt = $conn->prepare($get_question_data)) {
            $stmt->bind_param("i", $assignment_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $question_data = array();
            while ($row = $result->fetch_assoc())  {
	            $question_data[] = $row;
            }
            if (count($question_data) > 0) {
                echo 'window.question_data = '.json_encode($question_data).';';
            } else {
                echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=assignment_not_found");';
                echo '</script>';
                exit();
            }
        } else {
            echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error");';
            echo '</script>';
            exit();
        }
        $stmt->close();
    
        // If a user's id was provided, need to load all their info linked to the current assignment too.
        // If not, we're probably dealing with an edit session so this info isn't needed, and won't be POSTed.
        $user_id = isset($_POST["load_userid"]) ? $_POST["load_userid"] : "";
        if ($user_id == "true") {
        	$user_id = $_SESSION['user_id'];
            $get_response_data = "SELECT question_index,response_data FROM response_table WHERE (assignment_id = ? AND user_id = ?) ORDER BY question_index";
            if ($stmt = $conn->prepare($get_response_data)) {
                $stmt->bind_param("ii", $assignment_id, $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
				$response_data = array();
				while ($row = $result->fetch_assoc())  {
					$response_data[] = $row;
				}
                echo 'window.response_data = ' . json_encode($response_data) . ';';
            } else {
                echo "connection_error";
                exit();
            }
            $stmt->close();
            $get_score_data = "SELECT question_index,score,feedback_data FROM score_table WHERE (assignment_id = ? AND user_id = ?) ORDER BY question_index";
            if ($stmt = $conn->prepare($get_score_data)) {
                $stmt->bind_param("ii", $assignment_id, $user_id);
                $stmt->execute();
                $result = $stmt->get_result();
				$score_data = array();
				while ($row = $result->fetch_assoc())  {
					$score_data[] = $row;
				}
                echo 'window.score_data = ' . json_encode($score_data) . ';';
            } else {
                echo "connection_error";
                exit();
            }
            $stmt->close();
            // Also need to see if the user has an extension, and modify the loaded due date if so.
            $get_extension_data = "SELECT extensions FROM assignment_table WHERE assignment_id = ?";
            if ($stmt = $conn->prepare($get_extension_data)) {
                $stmt->bind_param("i", $assignment_id);
                $stmt->execute();
                $stmt->store_result();
                $stmt->bind_result($extension_data);
                $stmt->fetch();
            } else {
                echo "connection_error";
            }
            $stmt->close(); 
            $extension_array = json_decode("{}");
            if ($extension_data != "") $extension_array = json_decode($extension_data);
            if (property_exists($extension_array,$user_id)) {
            	echo 'window.assignment_data.due = "' . $extension_array->$user_id . '";';
            } 
        } else {
        	// We are viewing an assignment preview, so make empty fields for response_data and score_data,
        	// and set the flag for the editor so that we get the right navigation buttons.
        	echo 'window.response_data = [';
        	for ($i = 0; $i < count($question_data); $i++) {
        		echo '{';
        		echo '"question_index" : '. strval($i+1) .',';
        		echo '"response_data" : "{}"';
        		echo '}';
        		if ($i < count($question_data) - 1) echo ',';
        	}
        	echo '];';
			echo 'window.score_data = [';
			for ($i = 0; $i < count($question_data); $i++) {
        		echo '{';
        		echo '"question_index" : '. strval($i+1) .',';
        		echo '"score" : 0,';
        		echo '"feedback_data" : "{}"';
        		echo '}';
        		if ($i < count($question_data) - 1) echo ',';
        	}
        	echo '];';
        	echo 'window.preview = true';
        }
    
        // Close connection
//         mysqli_close($conn);
        echo "</script>";
        
    } else {
        // Client is opening the editor to build a new assignment; just set the assignment ID to -1, provide the class ID, and report success.
        echo 'window.loaded_assignment_id = -1;';
        echo 'window.assignment_data = {';
        	echo '"assignment_id" : -1,';
        	echo '"class_id" : ' . $class_id; 
        echo '};';
        echo 'window.question_data = [];';
        echo '</script>';
    }

    
?>