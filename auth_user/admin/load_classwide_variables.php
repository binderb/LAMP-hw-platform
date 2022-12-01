<?php

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    echo '<script type="text/javascript">';
    
    if (!isset($_SESSION["access"]) || ($_SESSION["access"] != "admin")) {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access");';
        echo '</script>';
        exit();
    }
    $assignment_id = isset($_POST["id"]) ? $_POST["id"] : "";
    if ($assignment_id == "") {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=invalid_access");';
        echo '</script>';
        exit();
    }

    // Attempt MySQL server connection.
    $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
    $conn->set_charset("utf8");
    
    // Get total number of points for this assignment
    $get_total_points = "SELECT sum(question_points) FROM assignment_questions WHERE assignment_id = ?";
    if ($stmt = $conn->prepare($get_total_points)) {
        $stmt->bind_param("i", $assignment_id);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($total_points);
        $stmt->fetch();
        echo 'window.total_points = '.$total_points.';';
    } else {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error");';
        echo '</script>';
        exit();
    }
    $stmt->close();
    
    // Retrieve classwide data from assignment_table and assign variables.
    $get_class_data = "SELECT a.user_id,a.username,a.first,a.last,b.question_index,b.response_data,c.score,c.feedback_data FROM ((user_table a JOIN assignment_table d ON (a.class_id = d.class_id AND d.assignment_id = ?)) LEFT JOIN response_table b ON (a.user_id = b.user_id AND b.assignment_id = ?)) LEFT JOIN score_table c ON (a.user_id = c.user_id AND c.assignment_id = ? AND b.question_index = c.question_index) WHERE a.access = 'student' ORDER BY a.last, a.first, a.username, b.question_index";
    if ($stmt = $conn->prepare($get_class_data)) {
        $stmt->bind_param("iii", $assignment_id, $assignment_id, $assignment_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $class_data = array();
        while ($row = $result->fetch_assoc())  {
            $class_data[] = $row;
        }
        // if (count($class_data) > 0) {
            echo 'window.class_data = '.json_encode($class_data).';';
//         } else {
//             echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=assignment_not_found");';
//             echo '</script>';
//             exit();
//         }
    } else {
        echo 'window.location.replace("' . $_ENV["APP_ROOT"] . '/common/auth_response.php?result=connection_error");';
        echo '</script>';
        exit();
    }
    $stmt->close();

    // Close connection
    mysqli_close($conn);
    
    echo '</script>';
    
?>