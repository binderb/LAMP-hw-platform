<?php
    session_start();

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
    
    if (!isset($_SESSION["access"]) || ($_SESSION["access"] != "admin" && $_SESSION["access"] != "student" && $_SESSION["access"] != "dev")) {
        echo "invalid_access";
        exit();
    }
    $assignment_id = isset($_POST["id"]) ? $_POST["id"] : "";
    if ($assignment_id == "") {
        echo "invalid_access_nologin";
        exit();
    }
    
    // Clear previous variables
    unset($_SESSION["loaded_assignment_id"]);
    unset($_SESSION["loaded_name"]);
    unset($_SESSION["loaded_available"]);
    unset($_SESSION["loaded_due"]);
    unset($_SESSION["loaded_points"]);
    unset($_SESSION["loaded_question_ids"]);
    unset($_SESSION["loaded_categories"]);
    unset($_SESSION["loaded_questions"]);
    unset($_SESSION["loaded_responses"]);
    unset($_SESSION["loaded_scores"]);
    unset($_SESSION["loaded_feedback"]);
    unset($_SESSION["loaded_graded"]);
    
    if ($assignment_id != -1) {
        // Client is requesting data for an existing assignment; look it up in the database.
        $_SESSION["loaded_assignment_id"] = $assignment_id;

        // Attempt MySQL server connection.
        $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
        $conn->set_charset("utf8");
    
        // Retrieve global data from assignment_manifest and assign session variables.
        $get_global_assignment_data = "SELECT name, available, due, graded FROM assignment_table WHERE assignment_id = ?";
        if ($stmt = $conn->prepare($get_global_assignment_data)) {
            $stmt->bind_param("i", $assignment_id);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($assignment_name,$available_from,$due_date,$graded);
            if ($stmt->num_rows() > 0) {
                $stmt->fetch();
                $_SESSION["loaded_name"] = $assignment_name;
                $_SESSION["loaded_available"] = $available_from;
                $_SESSION["loaded_due"] = $due_date;
                $_SESSION["loaded_graded"] = $graded;
            } else {
                echo "assignment_not_found";
                exit();
            }
        } else {
            echo "connection_error";
            exit();
        }
    
        // Retrieve question data from joined (assignment_questions + question_table) and assign session variables.
        $get_question_data = "SELECT a.question_index,a.question_points,b.question_id,b.question_category,b.question_data FROM assignment_questions a JOIN question_table b ON a.question_id = b.question_id WHERE a.assignment_id = ? ORDER BY a.question_index";
        if ($stmt = $conn->prepare($get_question_data)) {
            $stmt->bind_param("i", $assignment_id);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($question_index_i,$question_points_i,$question_id_i,$question_category_i,$question_data_i);
            if ($stmt->num_rows() > 0) {
                $question_points = [];
                $question_ids = [];
                $question_categories = [];
                $question_data = [];
                while ($stmt->fetch()) {
                    $question_points[] = $question_points_i;
                    $question_ids[] = $question_id_i;
                    $question_categories[] = $question_category_i;
                    $question_data[] = $question_data_i;
                }
                $_SESSION["loaded_points"] = $question_points;
                $_SESSION["loaded_question_ids"] = $question_ids;
                $_SESSION["loaded_categories"] = $question_categories;
                $_SESSION["loaded_questions"] = $question_data;
            } else {
                echo "assignment_not_found";
                exit();
            }
        } else {
            echo "connection_error";
            exit();
        }
        $stmt->close();
    
        // If a user's id was provided, need to load all their info linked to the current assignment too.
        // If not, we're probably dealing with an edit session so this info isn't needed, and won't be POSTed.
        $user_id = isset($_POST["load_userid"]) ? $_POST["load_userid"] : "";
        if ($user_id != "") {
            $get_response_data = "SELECT question_index,response_data FROM response_table WHERE (assignment_id = ? AND user_id = ?) ORDER BY question_index";
            if ($stmt = $conn->prepare($get_response_data)) {
                $stmt->bind_param("ii", $assignment_id, $user_id);
                $stmt->execute();
                $stmt->store_result();
                $stmt->bind_result($question_index_i,$response_data_i);
                if ($stmt->num_rows() > 0) {
                    $response_data = [];
                    while ($stmt->fetch()) $response_data[] = $response_data_i;
                    $_SESSION["loaded_responses"] = $response_data;
                }
            } else {
                echo "connection_error";
                exit();
            }
            $stmt->close();
            $get_score_data = "SELECT question_index,score,feedback_data FROM score_table WHERE (assignment_id = ? AND user_id = ?) ORDER BY question_index";
            if ($stmt = $conn->prepare($get_score_data)) {
                $stmt->bind_param("ii", $assignment_id, $user_id);
                $stmt->execute();
                $stmt->store_result();
                $stmt->bind_result($question_index_i,$score_i,$feedback_data_i);
                if ($stmt->num_rows() > 0) {
                    $scores = [];
                    $feedback_data = [];
                    while ($stmt->fetch()) {
                        $scores[] = $score_i;
                        $feedback_data[] = $feedback_data_i;
                    }
                    $_SESSION["loaded_scores"] = $scores;
                    $_SESSION["loaded_feedback"] = $feedback_data;
                }
            } else {
                echo "connection_error";
                exit();
            }
            $stmt->close();
            // Also need to see if the user has an extension, and modify the loaded due date if so.
            $get_extension_data = "SELECT extensions FROM assignment_table WHERE assignment_id = ?";
            if ($extension_stmt = $conn->prepare($get_extension_data)) {
                $extension_stmt->bind_param("i", $assignment_id);
                $extension_stmt->execute();
                $extension_stmt->store_result();
                $extension_stmt->bind_result($extension_data);
                $extension_stmt->fetch();
            } else {
                echo "connection_error";
            }
            $extension_stmt->close(); 
            $extension_array = [];
            if ($extension_data != "") $extension_array = json_decode($extension_data);
            if (property_exists($extension_array,$user_id)) $_SESSION["loaded_due"] = date("n/j/y g:ia",strtotime($extension_array->$user_id));
        }
    
        // Close connection
        mysqli_close($conn);
        $_SESSION["assignment_id"] = $assignment_id;
        echo "load_success";
        
    } else {
        // Client is opening the editor to build a new assignment; just set the ID to -1 and report success.
        $_SESSION["assignment_id"] = -1;
        echo "load_success";
    }
    
?>