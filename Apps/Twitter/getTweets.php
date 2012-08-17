<?php
preg_match('/\[.+\]/', readfile('tweets.txt'), $matches);
echo $matches;
?>