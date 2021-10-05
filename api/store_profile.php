<?php

/* This file is related to Ecwid Store Profile APIs */

require_once('../functions.php');

header('Access-Control-Allow-Origin: *');

try {
	// if (isset($_POST['token']) || empty($_POST['token']) || $_POST['token'] !== ECWID_PUBLIC_TOKEN) {
	// 	throw new Exception('Access forbidden', 403);
	// }

    $response = ecwidUpdateStoreProfile();

    if (is_int($response)) throw new Exception($response, $response);

    echo json_encode($response);

    die();

	throw new Exception('Access forbidden', 403);

} catch (Exception $e) {
	echo json_encode(array(
    	'message' => $e->getMessage(),
    	'status' => $e->getCode(),
    ));
    
	die();
}
