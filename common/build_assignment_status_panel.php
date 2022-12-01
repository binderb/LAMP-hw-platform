<?php
    session_start();

    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    if (!isset($_SESSION["access"]) || ($_SESSION["access"] != "admin" && $_SESSION["access"] != "student" && $_SESSION["access"] != "dev")) {
        header('Location: ./auth_response.php?result=invalid_access');
        exit();
    }
    
    // Need to determine whether the assignment is past due, or if we're viewing a preview (assignment_id = -1), and display controls accordingly.
    $assignment_id = isset($_SESSION["assignment_id"]) ? $_SESSION["assignment_id"] : "";
    if ($assignment_id == "") {
        header('Location: ./auth_response.php?result=invalid_access_nologin');
        exit();
    }
    
?>
<div class="white_panel" style="text-align:left; display:block;">
<h3 style="display:inline-block;margin-bottom:20px;">Assignment Status:</h3>
<?php
    if ($assignment_id == -1) {
        // This is a preview, so show the appropriate (lack of) controls.
        echo '<p>Viewing assignment in Preview Mode. Status controls disabled.</p>';
    } else {
        /*use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();

    // Attempt MySQL server connection.
        $conn = mysqli_connect("localhost", $_ENV["DB_USER"], $_ENV["DB_PSWD"], $_ENV["DB_NAME"]);
        // Get due date and compare to current time
        $query_status = "";
        $get_due_date = "SELECT due FROM assignment_manifest WHERE assignmentID = ?";
        if ($stmt = $conn->prepare($get_due_date)) {
            $stmt->bind_param("s", $assignment_id);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($due_date);
            if ($stmt->num_rows > 0) {
                $stmt->fetch();
                date_default_timezone_set("US/central");
                if (strtotime($due_date) >= time()) $query_status = "available";
                else $query_status = "past_due";
            } else {
                
            }
        } else {
            $query_status = "error";
        }
        // Close connection
        mysqli_close($conn);*/
        
        if (isset($_SESSION["loaded_due"])) {
            date_default_timezone_set("US/central");
            $query_status = (strtotime($_SESSION["loaded_due"]) >= time()) ? "available" : "past_due";
        } else $query_status = "error";
        
        if ($query_status == "available") {
            echo '<div id="status_block" style="display:inline-block;padding:10px;background-color:#60b369;color:white;font-weight:900;margin-left:15px;">Changes saved.</div>';
            echo '<div id="save_container" style="text-align:center;">';
            echo '<a id="save_button" class="lite_button" href="">Save Changes</a>';
            echo '</div>';
        }
        
        if ($query_status == "past_due") {
            echo '<p id="past_due_indicator">Assignment is past due, and you can no longer edit responses.</p>';
        }
        
        if ($query_status == "error") {
            echo '<p>There was an error connecting to the database. Please check your Internet connection, or contact your instructor for help.</p>';
        }

    }
?>
</div>