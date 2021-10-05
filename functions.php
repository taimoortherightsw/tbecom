<?php

define('ECWID_API_HOST', 'https://app.ecwid.com/api/v3');
define('ECWID_STORE_ID', '63750040');
define('ECWID_SECRET_TOKEN', 'secret_39DeTAEPeXKP1gccZrLDtu6BkVtzcRSx');

function executeCURL($url, $method = 'GET', $data = '', $headers = [], $catchErrors = false)
{
	$method = strtoupper($method);

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $url);

	// curl meta-data
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_ENCODING, '');
	curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
	curl_setopt($ch, CURLOPT_TIMEOUT, 0);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

	if ($method == 'POST' && is_array($data)) {
		curl_setopt($ch, CURLOPT_POST, count($data));
	} else {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
	}

	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	$response = curl_exec($ch);

    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

	curl_close($ch);

	if ($catchErrors && in_array($statusCode, [400, 401, 402, 403])) {
		return $statusCode;
	}

	return $response;
}

function ecwidUpdateStoreProfile() 
{
	$uri = sprintf('%s/%s/profile?token=%s',
		ECWID_API_HOST,
		ECWID_STORE_ID,
		ECWID_SECRET_TOKEN
	);

	$body = json_encode(array(
        'settings' => [
            'orderCommentsEnabled' => true,
            'orderCommentsCaption' => 'Additional Information',
            'orderCommentsRequired' => false
        ]
    ));

	$headers = array(
		'Content-Type: application/json',
		'Content-Length: ' . strlen($body)
	);

	$response = executeCURL($uri, 'PUT', $body, $headers, true);

	return $response;
}
