<?php
use ChamiloSession as Session;

function eventAccessTool($tool, $id_session = 0)
{
	if (empty($tool)) {
		return false;
	}
	$TABLETRACK_ACCESS = Database::get_main_table(TABLE_STATISTIC_TRACK_E_ACCESS);
	//for "what's new" notification
	$TABLETRACK_LASTACCESS = Database::get_main_table(TABLE_STATISTIC_TRACK_E_LASTACCESS);

	$_course = api_get_course_info();
	$courseId = api_get_course_int_id();
	$id_session = api_get_session_id();
	$tool = Database::escape_string($tool);
	$reallyNow = api_get_utc_datetime();
	$user_id = api_get_user_id();

	// record information
	// only if user comes from the course $_cid
	//if( eregi($_configuration['root_web'].$_cid,$_SERVER['HTTP_REFERER'] ) )
	//$pos = strpos($_SERVER['HTTP_REFERER'],$_configuration['root_web'].$_cid);
	$coursePath = isset($_course['path']) ? $_course['path'] : null;
	$params = array(
			'access_user_id' => $user_id,
			'c_id' => $courseId,
			'access_tool' => $tool,
			'access_date' => $reallyNow,
			'access_session_id' => $id_session,
			'user_ip' => api_get_real_ip()
		);
		Database::insert($TABLETRACK_ACCESS, $params);

	// "what's new" notification
	$sql = "UPDATE $TABLETRACK_LASTACCESS
			SET access_date = '$reallyNow'
			WHERE access_user_id = ".$user_id." AND c_id = '".$courseId."' AND access_tool = '".$tool."' AND access_session_id=".$id_session;
	$result = Database::query($sql);
	if (Database::affected_rows($result) == 0) {
		$sql = "INSERT INTO $TABLETRACK_LASTACCESS (access_user_id, c_id, access_tool, access_date, access_session_id)
				VALUES (".$user_id.", '".$courseId."' , '$tool', '$reallyNow', $id_session)";
		Database::query($sql);
	}
	return 1;
}