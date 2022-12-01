<?php
    use Dotenv\Dotenv;
    require '../vendor/autoload.php';
    $dotenv = Dotenv::createImmutable('..');
    $dotenv->load();
?>
<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' />
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="touch_icon.png">
<link rel="manifest" href="<?php echo $_ENV["APP_ROOT"];?>/common/manifest.json">
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,900&display=swap" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="<?php echo $_ENV["APP_ROOT"];?>/common/style.css"/>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>