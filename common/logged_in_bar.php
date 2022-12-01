<div class="white_panel">
<?php
    echo 'Logged in as <b>' . $_SESSION["username"] . '</b><span style="margin-left:20px"><a class="inline_link" href="' . $_ENV["APP_ROOT"] . '/common/logout_user.php">Logout</a></span>';
?>
</div>