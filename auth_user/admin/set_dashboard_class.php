<?php
	session_start();
	$_SESSION["selected_class"] = $_POST["value"];
	echo $_SESSION["selected_class"];
?>