<?php
use ChamiloSession as Session;

require_once __DIR__ . '/../../../main/forum/forumconfig.inc.php';
require_once __DIR__ . '/../../../main/forum/forumfunction.inc.php';

class AppWebService extends WSAPP
{
    const SERVICE_NAME = 'AppREST';

    /**
     * Generate the api key for a user
     * @param int $userId The user id
     * @return string The api key
     */
    public function generateApiKey($userId)
    {
        $apiKey = UserManager::get_api_keys($userId, self::SERVICE_NAME);

        if (empty($apiKey)) {
            UserManager::add_api_key($userId, self::SERVICE_NAME);

            $apiKey = UserManager::get_api_keys($userId, self::SERVICE_NAME);
        }

        return current($apiKey);
    }

    /**
     * Get the user api key
     * @param string $username The user name
     * @return string The api key
     */
    public function getApiKey($username)
    {
        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        if ($this->apiKey !== null) {
            return $this->apiKey;
        } else {
            $this->apiKey = $this->generateApiKey($userId);

            return $this->apiKey;
        }
    }
	
	/**
     * Get the user info and user api key
     * @param string $username The user name
     * @return array The api key join with user info 
     */
	public function getUserInfoApiKey($username)
    {
        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        if ($this->apiKey !== null) {
			$userInfo['apiKey'] = $this->apiKey;
			return $userInfo;
        } else {
            $this->apiKey = $this->generateApiKey($userId);
			$userInfo['apiKey'] = $this->apiKey;
			return $userInfo;
        }
    }

    /**
     * Check if the api is valid for a user
     * @param string $username The username
     * @param string $apiKeyToValidate The api key
     * @return boolean Whether the api belongs to the user return true. Otherwise return false
     */
    public static function isValidApiKey($username, $apiKeyToValidate)
    {
        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        $apiKeys = UserManager::get_api_keys($userId, self::SERVICE_NAME);

        if (!empty($apiKeys)) {
            $apiKey = current($apiKeys);

            if ($apiKey == $apiKeyToValidate) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the count of new messages for a user
     * @param string $username The username
     * @param int $lastId The id of the last received message
     * @return int The count fo new messages
     */
    public function countNewMessages($username, $lastId = 0)
    {
        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        return MessageManager::countMessagesFromLastReceivedMessage($userId, $lastId);
    }

    /**
     * Get the list of new messages for a user
     * @param string $username The username
     * @param int $lastId The id of the last received message
     * @return array the new message list
     */
    public function getNewMessages($username, $lastId = 0)
    {
        global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$messages = array();

        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        //$lastMessages = MessageManager::getMessagesFromLastReceivedMessage($userId, $lastId);
		
		$messagesTable = Database::get_main_table(TABLE_MESSAGE);
        $userTable = Database::get_main_table(TABLE_MAIN_USER);

        $lastMessages = array();

        $sql = "SELECT m.*, u.user_id, u.lastname, u.firstname "
                . "FROM $messagesTable as m "
                . "INNER JOIN $userTable as u "
                . "ON m.user_sender_id = u.user_id "
                . "WHERE m.user_receiver_id = $userId "
                . "AND (m.msg_status = '0' OR m.msg_status = '1') "
				. "AND m.id > $lastId "
                . "ORDER BY m.send_date DESC";

        $result = Database::query($sql);

        if ($result !== false) {
            while ($row = Database::fetch_assoc($result)) {
                $lastMessages[] = $row;
            }
        }

        foreach ($lastMessages as $message) {
            $hasAttachments = MessageManager::hasAttachments($message['id']);

            $messages[] = array(
                'id' => $message['id'],
                'title' => $message['title'],
                'sender' => array(
                    'id' => $message['user_id'],
                    'lastname' => $message['lastname'],
                    'firstname' => $message['firstname'],
                    'completeName' => api_get_person_name($message['firstname'], $message['lastname']),
                ),
                'sendDate' => $message['send_date'],
                'content' => str_replace('src="/','src="'.$ruta,$message['content']),
                'hasAttachments' => $hasAttachments,
                'platform' => array(
                    'website' => api_get_path(WEB_PATH),
                    'messagingTool' => api_get_path(WEB_PATH) . 'main/messages/inbox.php'
                )
            );
        }

        return $messages;
    }
	
	public function getRemoveMessages($list, $username)
	{
		$list = explode('-',$list);
		
		$userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];

        //$lastMessages = MessageManager::getMessagesFromLastReceivedMessage($userId, $lastId);
		
		$messagesTable = Database::get_main_table(TABLE_MESSAGE);
        $userTable = Database::get_main_table(TABLE_MAIN_USER);

        $listMessages = array();

        $sql = "SELECT m.id "
             . "FROM $messagesTable as m "
             . "WHERE m.user_receiver_id = $userId "
             . "AND (m.msg_status = '0' OR m.msg_status = '1') ";

        $result = Database::query($sql);

        if ($result !== false) {
            while ($row = Database::fetch_assoc($result)) {
                $listMessages[] = $row['id'];
            }
        }
		
		$list_remove = array();
		foreach($list as $value){
			if(!in_array($value,$listMessages)){
				$list_remove[] = $value;
			}
		}
		
		return $list_remove;
			
	}
	
	/**
     * Get the list of new messages for a user
     * @param string $username The username
     * @param int $lastId The id of the last received message
     * @return array the new message list
     */
    public function getAllMessages($username)
    {
        global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$messages = array();

        $userInfo = api_get_user_info_from_username($username);
        $userId = $userInfo['user_id'];
		
		$messagesTable = Database::get_main_table(TABLE_MESSAGE);
        $userTable = Database::get_main_table(TABLE_MAIN_USER);

        $all_messages = array();

        $sql = "SELECT m.*, u.user_id, u.lastname, u.firstname "
                . "FROM $messagesTable as m "
                . "INNER JOIN $userTable as u "
                . "ON m.user_sender_id = u.user_id "
                . "WHERE m.user_receiver_id = $userId "
                . "AND (m.msg_status = '0' OR m.msg_status = '1') "
                . "ORDER BY m.send_date DESC";

        $result = Database::query($sql);

        if ($result !== false) {
            while ($row = Database::fetch_assoc($result)) {
                $all_messages[] = $row;
            }
        }

      	foreach ($all_messages as $message) {
            $hasAttachments = MessageManager::hasAttachments($message['id']);

            $messages[] = array(
                'id' => $message['id'],
                'title' => $message['title'],
                'sender' => array(
                    'id' => $message['user_id'],
                    'lastname' => $message['lastname'],
                    'firstname' => $message['firstname'],
                    'completeName' => api_get_person_name($message['firstname'], $message['lastname']),
                ),
                'sendDate' => $message['send_date'],
                'content' => str_replace('src="/','src="'.$ruta,$message['content']),
                'hasAttachments' => $hasAttachments,
                'platform' => array(
                    'website' => api_get_path(WEB_PATH),
                    'messagingTool' => api_get_path(WEB_PATH) . 'main/messages/inbox.php'
                )
            );
        }

        return $messages;
    }

	
	public function getUsersMessage($user_id, $user_search)
	{
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		
		$track_online_table      = Database::get_main_table(TABLE_STATISTIC_TRACK_E_ONLINE);
        $tbl_my_user		     = Database::get_main_table(TABLE_MAIN_USER);
        $tbl_my_user_friend      = Database::get_main_table(TABLE_MAIN_USER_REL_USER);
        $tbl_user 			     = Database::get_main_table(TABLE_MAIN_USER);
        $tbl_access_url_rel_user = Database :: get_main_table(TABLE_MAIN_ACCESS_URL_REL_USER);
        $search				     = Database::escape_string($user_search);

        $access_url_id           = api_get_multiple_access_url() == 'true' ? api_get_current_access_url_id() : 1;
        $user_id                 = api_get_user_id();
        $is_western_name_order   = api_is_western_name_order();

        $likeCondition = " AND (firstname LIKE '%$search%' OR lastname LIKE '%$search%' OR email LIKE '%$search%') ";

        if (api_get_setting('allow_social_tool')=='true' && api_get_setting('allow_message_tool') == 'true') {
            // All users
            if (api_get_setting('allow_send_message_to_all_platform_users') == 'true' || api_is_platform_admin() ) {
                if ($access_url_id != 0) {
                    $sql = "SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                            FROM $tbl_user u LEFT JOIN $tbl_access_url_rel_user r ON u.user_id = r.user_id
                            WHERE
                                u.status <> 6  AND
                                u.user_id <> $user_id AND
                                r.access_url_id = $access_url_id
                                $likeCondition ";

                } else {
                    $sql = "SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                            FROM $tbl_user u
                            WHERE
                                u.status <> 6  AND
                                u.user_id <> $user_id
                                $likeCondition ";
                }
            } else {
                //only my contacts
                if ($access_url_id != 0) {
                    $sql = "SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                            FROM $tbl_access_url_rel_user r, $tbl_my_user_friend uf
                            INNER JOIN $tbl_my_user AS u
                            ON uf.friend_user_id = u.user_id
                            WHERE
                                u.status <> 6 AND
                                relation_type NOT IN(".USER_RELATION_TYPE_DELETED.", ".USER_RELATION_TYPE_RRHH.") AND
                                uf.user_id = $user_id AND
                                friend_user_id <> $user_id AND
                                u.user_id = r.user_id AND
                                r.access_url_id = $access_url_id
                                $likeCondition";
                } else {
                    $sql = "SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                            FROM $tbl_my_user_friend uf
                            INNER JOIN $tbl_my_user AS u
                            ON uf.friend_user_id = u.user_id
         	                WHERE
                                u.status <> 6 AND
                                relation_type NOT IN(".USER_RELATION_TYPE_DELETED.", ".USER_RELATION_TYPE_RRHH.") AND
                                uf.user_id = $user_id AND
                                friend_user_id <> $user_id
                                $likeCondition";
                }
            }
        } elseif (api_get_setting('allow_social_tool')=='false' && api_get_setting('allow_message_tool')=='true') {
            if (api_get_setting('allow_send_message_to_all_platform_users') == 'true') {
                $sql = "SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                        FROM $tbl_user u LEFT JOIN $tbl_access_url_rel_user r ON u.user_id = r.user_id
                        WHERE
                            u.status <> 6  AND
                            u.user_id <> $user_id AND
                            r.access_url_id = $access_url_id
                            $likeCondition ";
            } else {
                $time_limit = api_get_setting('time_limit_whosonline');
                $online_time = time() - $time_limit*60;
                $limit_date	 = api_get_utc_datetime($online_time);
                $sql = "SELECT SELECT DISTINCT u.user_id as id, u.firstname, u.lastname, u.email
                        FROM $tbl_my_user u INNER JOIN $track_online_table t
                        ON u.user_id=t.login_user_id
                        WHERE login_date >= '".$limit_date."' AND
                        $likeCondition";
            }
        }
        $sql .=' LIMIT 20';
        $result = Database::query($sql);

        $showEmail = api_get_setting('show_email_addresses');
        $return = array();
        if (Database::num_rows($result) > 0) {
            while ($row = Database::fetch_array($result, 'ASSOC')) {
                $name = api_get_person_name($row['firstname'], $row['lastname']);
                if ($showEmail == 'true') {
                    $name .= ' ('.$row['email'].')';
                }
                $return[] = array(
                    'text' => $name,
                    'id' => $row['id']
                );
            }
        }
		//error_log(print_r($return,1));
		return $return;
	}

	public function sendNewEmail($to_userid, $title, $text, $user_id)
    {
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
	
		if (is_array($to_userid) && count($to_userid)> 0) {
			foreach ($to_userid as $user) {
				//error_log(print_r($user,1));
				$res = MessageManager::send_message(
					$user,
					$title,
					$text);
					/*	
					$_FILES,
					$file_comments,
					$group_id,
					$parent_id
					);
					*/
			}
			return true;
		}else{
			return false;
		}
	}
	
	public function sendReplyEmail($message_id, $title, $text, $check_quote, $user_id)
    {
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		
		$message_info = MessageManager::get_message_by_id($message_id);
		
		$user = $message_info['user_sender_id'];
		$reply = '';
		if($check_quote == '1'){
			$user_reply_info = api_get_user_info($message_info['user_sender_id']);
			$reply .= '<p><br/></p>'.sprintf(
				get_lang('XWroteY'),
				$user_reply_info['complete_name'],
				Security::filter_terms($message_info['content'])
			);
		}
		$text_message = $reply.' '.$text;
		$res = MessageManager::send_message($user, $title, $text_message);
		if($res){			
			return true;
		}else{
			return false;
		}
	}
	
	/**
     * Get the list of courses for a user
     * @param int $user_id The id of the user
     * @return array the courses list
     */
    public function getCoursesList($user_id)
    {
        $courses = array();
        $listCourses = CourseManager::get_courses_list_by_user_id($user_id);
		
        foreach ($listCourses as $course) {
			
			//$course_info = api_get_course_info($course_code);
			$infoCourse = api_get_course_info_by_id($course['real_id']);
			//$info = CourseManager::get_course_information_by_id($course['real_id']);
			//$infoCourse = api_format_course_array($info);

			$teacher = CourseManager::get_teacher_list_from_course_code_to_string($infoCourse['code']);
            /*
            $store_path = api_get_path(SYS_COURSE_PATH).$infoCourse['path'];
            $url_picture = $store_path.'/course-pic85x85.png';

            if (!file_exists($url_picture)) {
                $url_picture = '';
            }else{
				$url_picture = api_get_path(WEB_COURSE_PATH).$infoCourse['path'].'/course-pic85x85.png';
			}
			*/
			$courses[] = array(
                'id' => $infoCourse['real_id'],
                'title' => $infoCourse['title'],
                'code' => $infoCourse['code'],
                'directory' => $infoCourse['directory'],
				'url_picture' => $infoCourse['course_image_large'], //$url_picture,
				'course_image' => $infoCourse['course_image'],
                'teacher' => $teacher
            );
        }

        return $courses;
    }
	
	
	/**
     * Get the profile info user
     * @param int $user_id The id of the user
     * @return array the user info
     */
    public function getProfile($user_id)
    {
		//$user = UserManager::get_user_info_by_id($user_id);
		$user = api_get_user_info($user_id);
		
		$firstname = null;
		$lastname = null;
	
		if (isset($user['firstname']) && isset($user['lastname'])) {
			$firstname = $user['firstname'];
			$lastname = $user['lastname'];
		} elseif (isset($user['firstName']) && isset($user['lastName'])) {
			$firstname = isset($user['firstName']) ? $user['firstName'] : null;
			$lastname = isset($user['lastName']) ? $user['lastName'] : null;
		}
	
		$user['complete_name'] = api_get_person_name($firstname, $lastname);
		$user['complete_name_with_username'] = $result['complete_name'];
		
		if (!empty($user['username'])) {
			$user['complete_name_with_username'] = $user['complete_name'].' ('.$user['username'].')';
		}
		
		//$t_uf  = Database :: get_main_table(TABLE_MAIN_USER_FIELD);
	    //$t_ufv = Database :: get_main_table(TABLE_MAIN_USER_FIELD_VALUES);
		
		$t_uf  = Database :: get_main_table(TABLE_EXTRA_FIELD);
	    $t_ufv = Database :: get_main_table(TABLE_EXTRA_FIELD_VALUES);
		
		$extra = array();
		
		$sql = "SELECT a.display_text ,b.value "
              ." FROM $t_uf a INNER JOIN $t_ufv b ON a.id=b.field_id "
			  ." WHERE a.visible='1' AND b.item_id='".$user_id."' AND b.value<>'';";
        $rs = Database::query($sql);
		while( $row = Database::fetch_row($rs) ) {
			$extra[] = $row;
		}
		$user['extra'] = $extra;
		
		$user['picture_uri'] = UserManager::getUserPicture($user_id);
		
		/*
		$img_array = UserManager::get_user_picture_path_by_id($user_id, 'web', true, true);
		$user['picture_uri'] = $img_array['dir'].$img_array['file'];
		*/
		return $user;
    }
	
	/**
     * Register course access
     * @param int $c_id The id course
     * @return booleano true if success
     */
    public function registerAccessCourse($c_id, $user_id)
    {
		$courseInfo = api_get_course_info_by_id($c_id);
		$course_code = $courseInfo['code'];
		
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);
		/* Fin login */
		Event::accessCourse();
	}
	
	/**
     * Get description of course
     * @param int $c_id The id course
     * @return array the all descriptions
     */
    public function getDescription($c_id, $username)
    {
		$courseInfo = api_get_course_info_by_id($c_id);	
		$user_id = UserManager::get_user_id_from_username($username);
	
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		Login::init_user($user_id, true);
		Login::init_course($courseInfo['code'], true);
		// Tracking
		eventAccessTool(TOOL_COURSE_DESCRIPTION);
		//Event::event_access_tool(TOOL_COURSE_DESCRIPTION);
		
		global $_configuration;
		$ruta = $_configuration['root_web'];
				
		$libpath = api_get_path(LIBRARY_PATH);
		require_once $libpath.'course_description.lib.php';
        
		$descriptions = CourseDescription::get_descriptions($c_id);
		$results = array();
		foreach($descriptions as $description) {
			$results[] = array('id' => $description->get_description_type(),
								'title' => $description->get_title(),
								'content' => str_replace('src="/','src="'.$ruta,$description->get_content()));
		}
		return $results;
    }
	
	/**
     * Get notebook of course
     * @param int $c_id The id course
     * @param string $username 
     * @return array the all notebook
     */
    public function getNotebook($c_id, $username)
    {
		$courseInfo = api_get_course_info_by_id($c_id);	
		$user_id = UserManager::get_user_id_from_username($username);
	
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		Login::init_user($user_id, true);
		Login::init_course($courseInfo['code'], true);
		// Tracking
		eventAccessTool(TOOL_NOTEBOOK);
		//Event::event_access_tool(TOOL_COURSE_DESCRIPTION);
		
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$t_notebook = Database :: get_course_table(TABLE_NOTEBOOK);
		$sql = "SELECT * FROM $t_notebook
                WHERE
                    c_id = $c_id AND
                    user_id = '" . api_get_user_id() . "'
                ";
        $result = Database::query($sql);
		$results = array();
		while ($row = Database::fetch_array($result)) {
			$creation_date = api_get_local_time($row['creation_date'], null, date_default_timezone_get());
            $update_date = api_get_local_time($row['update_date'], null, date_default_timezone_get());
			if($row['update_date']==$row['creation_date']){
				$update = '';
			}else{
				$update = date_to_str_ago($update_date).' '.$update_date;	
			}
			$results[] = array('id' => $row['notebook_id'],
								'title' => $row['title'],
								'description' => str_replace('src="/','src="'.$ruta,$row['description']),
								'creation_date' => date_to_str_ago($creation_date).' '.$creation_date,
								'update_date' => $update);	
		}
		return $results;
    }
	
	/**
     * Get documents of course
     * @param int $c_id The id course
     * @return array the all documents
     */
    public function getDocuments($c_id, $path, $user_id)
    {	
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		Event::event_login($_user['user_id']);
		Login::init_user($user_id, true);
		/* Fin login */
		
		$lib_path = api_get_path(LIBRARY_PATH);
		require_once $lib_path.'fileDisplay.lib.php';
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		//$_course = CourseManager::get_course_information_by_id($c_id);
		$_course = api_get_course_info_by_id($c_id);
				
		$libpath = api_get_path(LIBRARY_PATH);
		require_once $libpath.'document.lib.php';
        
		$documents = DocumentManager::get_all_document_data($_course,$path);
		
		$results = array();
		
		foreach($documents as $document) {
			if($document['visibility'] == "1"){
				if($document['filetype'] == "file"){
					$icon = choose_image($document['path']);
				}else{
					if ($document['path'] == '/shared_folder') {
						$icon = 'folder_users.gif';
					} elseif (strstr($document['path'], 'shared_folder_session_')) {
						$icon = 'folder_users.gif';
					} else {
						$icon = 'folder_document.gif';
			
						if ($document['path'] == '/audio') {
							$icon = 'folder_audio.gif';
						} elseif ($document['path'] == '/flash') {
							$icon = 'folder_flash.gif';
						} elseif ($document['path'] == '/images') {
							$icon = 'folder_images.gif';
						} elseif ($document['path'] == '/video') {
							$icon = 'folder_video.gif';
						} elseif ($document['path'] == '/images/gallery') {
							$icon = 'folder_gallery.gif';
						} elseif ($document['path'] == '/chat_files') {
							$icon = 'folder_chat.gif';
						} elseif ($document['path'] == '/learning_path') {
							$icon = 'folder_learningpath.gif';
						}
					}
				}
				$results[] = array('id' => $document['id'],
									'filetype' => $document['filetype'],
									'path' => $document['path'],
									'filename' => basename($document['path']),
									'title' => $document['title'],
									'icon' => $icon,
									'size' => $document['size']);
			}
		}
		//error_log(print_r($results,1));
		return $results;
    }
	
	/**
     * Get announcements of course
     * @param int $c_id The course id
	 * @param int $user_id 
     * @return array the all announcements
     */
    public function getAnnouncements($c_id, $user_id, $session_id = 0)
    {
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$info_course = api_get_course_info_by_id($c_id);
		$info_user = api_get_user_info($user_id);
		$teacher_list = CourseManager::get_teacher_list_from_course_code($info_course['code']);

        $teacher_name = '';
        if (!empty($teacher_list)) {
            foreach ($teacher_list as $teacher_data) {
                $teacher_name = api_get_person_name($teacher_data['firstname'], $teacher_data['lastname']);
                $teacher_email = $teacher_data['email'];
                break;
            }
        }

        $courseLink = api_get_course_url($info_course['code'], $session_id);
	
		$tbl_announcement = Database::get_course_table(TABLE_ANNOUNCEMENT);
        $tbl_item_property = Database::get_course_table(TABLE_ITEM_PROPERTY);

        if (!empty($user_id) && is_numeric($user_id)) {
            $user_id = intval($user_id);
            $sql = "SELECT announcement.iid, announcement.c_id, announcement.id, announcement.title, announcement.content, announcement.display_order, toolitemproperties.insert_user_id,toolitemproperties.lastedit_date ".
					"FROM $tbl_announcement announcement, $tbl_item_property toolitemproperties ".
					"WHERE ".
						"announcement.c_id = $c_id AND ".
						"toolitemproperties.c_id = $c_id AND ".
						"announcement.id = toolitemproperties.ref AND ".
						"toolitemproperties.tool='announcement' AND ".
						"( ".
						  "(toolitemproperties.to_user_id='$user_id' OR toolitemproperties.to_user_id is null) AND ".
						  "(toolitemproperties.to_group_id='0' OR toolitemproperties.to_group_id is null) ".
						") ".
						"AND toolitemproperties.visibility='1' ".
						"AND announcement.session_id ='0' ".
					"ORDER BY display_order DESC"; 
            $rs = Database::query($sql);
            $num_rows = Database::num_rows($rs);
            $content = '';
            $result = array();
            if ($num_rows > 0) {
                while ($myrow = Database::fetch_array($rs)) {
				    $info_user_publisher = api_get_user_info($myrow['insert_user_id']);
					$content = $myrow['content'];
					$content = str_replace('src="/','src="'.$ruta,$content);
					$content = str_replace('((user_name))',$info_user['username'],$content);
					$content = str_replace('((user_firstname))',$info_user['firstname'],$content);
					$content = str_replace('((user_lastname))',$info_user['lastname'],$content);
					$content = str_replace('((teacher_name))',$teacher_name,$content);
					$content = str_replace('((teacher_email))',$teacher_email,$content);
					$content = str_replace('((course_title))',$info_course['title'],$content);
					$content = str_replace('((course_link))',Display::url($courseLink, $courseLink),$content);
					$content = str_replace('((official_code))',$info_user['official_code'],$content);
					
                    $result[] = array(
					   'iid' => $myrow['iid'],
				   	   'c_id' => $myrow['c_id'],
					   'a_id' => $myrow['id'],
					   'title' => $myrow['title'],
					   'content' => $content,
					   'teacher' => $info_user_publisher['firstname'].' '.$info_user_publisher['lastname'], 
					   'display_order' => $myrow['display_order'],
					   'last_edit' => api_get_local_time($myrow['lastedit_date'])
					);
                }
                return $result;
            }else{
				return $result;	
			}
        }else{
			return false;	
		}
	}
	
	/**
	 *
	 *
	 *
	 */
    public function getCourseEvents($course_id, $user_id, $session_id = 0)
    {	
        global $_configuration;
        $ruta = $_configuration['root_web'];
		
        if (empty($course_id)) {
            return array();
        }
		
		$courseInfo = api_get_course_info_by_id($course_id);
        //$courseInfo = CourseManager::get_course_information_by_id($course_id);
        $course_id = $courseInfo['real_id'];
        $user_id = intval($user_id);
        $session_id = intval($session_id);
        
		if($session_id > 0){
			$where_session = "AND ip.session_id = $session_id";
		}else{
			$where_session = "AND (ip.session_id = $session_id OR ip.session_id IS NULL)"; 	
		}
		
		$group_memberships = GroupManager::get_group_ids($course_id, $user_id);
        
        $tlb_course_agenda = Database::get_course_table(TABLE_AGENDA);
        $tbl_property = Database::get_course_table(TABLE_ITEM_PROPERTY);

        if (is_array($group_memberships) && count($group_memberships) > 0) {
            $where_condition = "( ip.to_user_id = $user_id OR ip.to_group_id IN (0, ".implode(", ", $group_memberships).") OR ip.insert_user_id = $user_id ) ";

            $sql = "SELECT DISTINCT agenda.*
                    FROM $tlb_course_agenda agenda
                    INNER JOIN $tbl_property ip
                    ON (agenda.id = ip.ref AND agenda.c_id = ip.c_id)
                    WHERE
                        ip.tool         ='".TOOL_CALENDAR_EVENT."' AND
                        $where_condition AND
                        ip.visibility   = '1' AND
                        agenda.c_id     = $course_id AND
                        ip.c_id         = $course_id AND 
						(agenda.end_date >= '".api_get_utc_datetime(date("Y-m-d H:i:s"))."' OR (agenda.end_date LIKE '".date("Y-m-d")."%' AND agenda.all_day='1'))
                    ORDER BY agenda.start_date ASC
					";
        } else {
            $visibilityCondition = " ip.visibility='1' AND";
            $where_condition = " ( ip.to_user_id = $user_id OR ip.to_group_id='0' OR ip.insert_user_id = $user_id ) AND ";

            $sql = "SELECT DISTINCT agenda.*
                    FROM $tlb_course_agenda agenda INNER JOIN $tbl_property ip
                    ON (agenda.id = ip.ref AND agenda.c_id = ip.c_id)
                    WHERE
                        ip.tool='".TOOL_CALENDAR_EVENT."' AND
                        $where_condition
                        $visibilityCondition
                        agenda.c_id = $course_id AND
                        ip.c_id = $course_id AND
                        agenda.session_id = $session_id AND
						(agenda.end_date >= '".api_get_utc_datetime(date("Y-m-d H:i:s"))."' OR (agenda.end_date LIKE '".date("Y-m-d")."%' AND agenda.all_day='1'))
                        $where_session
					ORDER BY agenda.start_date ASC
                    ";
        }

        $result = Database::query($sql);
        if (Database::num_rows($result)) {
            $results = array();
            
            while ($row = Database::fetch_array($result, 'ASSOC')) {
				$results[] = array(
				   'iid' => $row['iid'],
                   'c_id' => $row['c_id'],
                   'a_id' => $row['id'],
                   'title' => $row['title'],
                   'content' => str_replace('src="/','src="'.$ruta,$row['content']),
                   'start_date' => api_get_local_time($row['start_date']), 
                   'end_date' => api_get_local_time($row['end_date']),
                   'all_day' => $row['all_day']
                   );
            }
            return $results;
        }else{
            $results = array();
            return $results;
        }
    }
	
	
	/**
	 *
	 *
	 *
	 */
    public function getForums($course_id, $user_id, $session_id = 0)
    {	
		$courseInfo = api_get_course_info_by_id($course_id);
		//$courseInfo = CourseManager::get_course_information_by_id($course_id);
		$course_code = $courseInfo['code'];
		
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		Event::event_login($_user['user_id']);
		
		/* Fin login */
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);

		/* TRACKING */
		eventAccessTool(TOOL_FORUM);
		
		//global $TABLETRACK_ACCESS;
		$table_access = Database::get_main_table(track_e_access);
		$id_session    = 0;
		$tool          = Database::escape_string(TOOL_FORUM);
		$reallyNow     = api_get_utc_datetime();

		$sql = "INSERT INTO ".$table_access."
        			(access_user_id,
        			 c_id,
        			 access_tool,
        			 access_date,
        			 access_session_id
        			 )
        		VALUES
        			(".$user_id.",".// Don't add ' ' around value, it's already done.
        			"'".$course_id."' ,
        			'".$tool."',
        			'".$reallyNow."',
        			'".$id_session."')";
        Database::query($sql);

		$forum_list = get_forums();

		if (is_array($forum_list)) {
			 foreach ($forum_list as $key => $value) {
                $last_post_info_of_forum = get_last_post_information($key, $course_id);
                $forum_list[$key]['last_post_date'] = api_convert_and_format_date($last_post_info_of_forum['last_post_date']);
                $forum_list[$key]['last_poster'] = $last_post_info_of_forum['last_poster_firstname'].' '.$last_post_info_of_forum['last_poster_lastname'];
                
            }
        } else {
            $forum_list = array();
        }

		$table_categories = Database :: get_course_table(TABLE_FORUM_CATEGORY);
        $table_item_property = Database :: get_course_table(TABLE_ITEM_PROPERTY);
		$sql = "SELECT *
                FROM ".$table_categories." forum_categories, ".$table_item_property." item_properties
                WHERE
                    forum_categories.cat_id=item_properties.ref AND
                    item_properties.visibility=1 AND
                    item_properties.tool = '".TOOL_FORUM_CATEGORY."' AND
					forum_categories.c_id = '".$course_id."' AND item_properties.c_id = '".$course_id."'  
                ORDER BY forum_categories.cat_order ASC";		
				
		$result = Database::query($sql);
		$forum_categories_list = array();
	
		while ($row = Database::fetch_array($result)) {
			$forum_categories_list[$row['cat_id']] = $row;
		}		
				
		return array('info_forum' => $forum_list, 'info_category' => $forum_categories_list);	
	}
	
	/**
	 *
	 *
	 *
	 */
    public function  getThreads($c_id, $forum_id){
		$courseInfo = api_get_course_info_by_id($c_id);
		//$courseInfo = CourseManager::get_course_information_by_id($c_id);
		$course_code = $courseInfo['code'];
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);
		
		$thread_list = get_threads($forum_id, $course_code);
		foreach ($thread_list as $key => $value) {
			$thread_list[$key]['last_post_date'] = api_convert_and_format_date($value['thread_date']);
		}
		
		$table_forums = Database :: get_course_table(TABLE_FORUM);
		$sql = "SELECT forum_title FROM $table_forums forum
                WHERE forum.c_id = $c_id AND forum.forum_id = $forum_id";
		$rs = Database::query($sql);
		$row = Database::fetch_array($rs, 'ASSOC');
		
		$result_return = array('threads' => $thread_list, 'forum_title' => $row['forum_title']);
		return $result_return;		
	}
	
	/**
	 *
	 *
	 *
	 */
    public function  getPosts($c_id, $forum_id, $thread_id){
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$courseInfo = api_get_course_info_by_id($c_id);		
		//$courseInfo = CourseManager::get_course_information_by_id($c_id);
		$course_code = $courseInfo['code'];
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);
		$post_list = getPosts($thread_id);

		foreach ($post_list as $key => $value) {
			$post_list[$key]['date'] = api_convert_and_format_date($value['post_date']);
			$post_list[$key]['post_text'] = str_replace('src="/','src="'.$ruta,$value['post_text']);
			$post_list[$key]['post_text'] = str_replace('src="../../','src="'.$ruta,$post_list[$key]['post_text']);
		
			//Get attachment post
			$post_id = $value['post_id'];
			$attachment = getAllAttachment($post_id);
			$aux_path = array();
			$aux_filename = array();
			foreach ($attachment as $value2) {
				$aux_path[] = $value2['path'];
				$aux_filename[] = $value2['filename'];
			}
			$post_list[$key]['path'] = $aux_path;
			$post_list[$key]['filename'] = $aux_filename;
		}
		$table_threads = Database :: get_course_table(TABLE_FORUM_THREAD);
		$sql = "SELECT thread_title FROM $table_threads thread
                WHERE thread.c_id = $c_id AND thread.thread_id = $thread_id";
		$rs = Database::query($sql);
		$row = Database::fetch_array($rs, 'ASSOC');
		
		$result_return = array('posts' => $post_list, 'thread_title' => $row['thread_title']);
		increase_thread_view($thread_id);
		return $result_return;		
	}
	
	public function createThread($c_id, $forum_id, $title, $text, $notice, $user_id){
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		//Login::init_course($c_id, true);

		$table_threads = Database :: get_course_table(TABLE_FORUM_THREAD);
    	$table_posts = Database :: get_course_table(TABLE_FORUM_POST);
		
		$course_id = $c_id;
		$courseInfo = api_get_course_info_by_id($c_id);	
		//$courseInfo = CourseManager::get_course_information_by_id($course_id);
		//$user = UserManager::get_user_info_by_id($user_id);
		$user = api_get_user_info($user_id);
		
		$poster_name = $user['firstname'].' '.$user['lastname'];
		$post_date = api_get_utc_datetime();
		$visible = 1;
		$clean_post_title = Database::escape_string(stripslashes($title));
		$my_post_notification = isset($notice) ? $notice : null;

		$sql = "INSERT INTO $table_threads (c_id, thread_title, forum_id, thread_poster_id, thread_poster_name, thread_date, session_id)
                VALUES (
                    ".$course_id.",
                    '".$clean_post_title."',
                    '".Database::escape_string($forum_id)."',
                    '".Database::escape_string($user_id)."',
                    '".Database::escape_string(stripslashes(isset($poster_name) ? $poster_name : null))."',
                    '".Database::escape_string($post_date)."',0)";
        Database::query($sql);
        $last_thread_id = Database::insert_id();

		$sql = "UPDATE $table_threads SET thread_id='".$last_thread_id."' WHERE iid='".$last_thread_id."'";

		if ($last_thread_id) {
            api_item_property_update($courseInfo, TOOL_FORUM_THREAD, $last_thread_id, 'ForumThreadAdded', api_get_user_id());
            api_set_default_visibility($last_thread_id, TOOL_FORUM_THREAD);
		}

        $sql = "INSERT INTO $table_posts (c_id, post_title, post_text, thread_id, forum_id, poster_id, poster_name, post_date, post_notification, post_parent_id, visible)
                VALUES (
                ".$course_id.",
                '".$clean_post_title."',
                '".Database::escape_string($text)."',
                '".Database::escape_string($last_thread_id)."',
                '".Database::escape_string($forum_id)."',
                '".Database::escape_string($user_id)."',
                '".Database::escape_string(stripslashes(isset($poster_name) ? $poster_name : null))."',
                '".Database::escape_string($post_date)."',
                '".Database::escape_string(isset($notice) ? $notice : null)."','0',
                '".Database::escape_string($visible)."')";
        Database::query($sql);
        $last_post_id = Database::insert_id();
	
		$sql = "UPDATE $table_posts SET post_id='".$last_post_id."' WHERE iid='".$last_post_id."'";
		Database::query($sql);
		
		if ($my_post_notification == 1) {
        	$table_notification = Database::get_course_table(TABLE_FORUM_NOTIFICATION);
			$database_field = 'thread_id';
			$sql = "SELECT * FROM $table_notification WHERE c_id = $course_id AND $database_field = '".Database::escape_string($last_thread_id)."' AND user_id = '".Database::escape_string($user_id)."'";
			$result = Database::query($sql);
			$total = Database::num_rows($result);

			if ($total <= 0) {
				$sql = "INSERT INTO $table_notification (c_id, $database_field, user_id) VALUES (".$course_id.", '".Database::escape_string($last_thread_id)."','".Database::escape_string($user_id)."')";
				$result = Database::query($sql);
			} 
		}
        // Now we have to update the thread table to fill the thread_last_post field (so that we know when the thread has been updated for the last time).
        $sql = "UPDATE $table_threads SET thread_last_post='".Database::escape_string($last_post_id)."'
                WHERE c_id = $course_id AND thread_id='".Database::escape_string($last_thread_id)."'";
        $result = Database::query($sql);
		if($result){
			return true;	
		}else{
			return false;
		}
	}
	
	public function createPost($c_id, $forum_id, $thread_id, $title, $text, $notice, $user_id, $post_parent){
		/* LOGIN */
		$chamiloUser = api_get_user_info($user_id);
		$_user['user_id'] = $chamiloUser['user_id'];
		$_user['status'] = (isset($chamiloUser['status']) ? $chamiloUser['status'] : 5);
		$_user['uidReset'] = true;
		Session::write('_user', $_user);
		$uidReset = true;
		$logging_in = true;
		//Event::event_login($_user['user_id']);
		/* Fin login */
		Login::init_user($user_id, true);
		$course_id = $c_id;
		$_course = api_get_course_info_by_id($c_id);	
		//$_course = CourseManager::get_course_information_by_id($course_id);
		$table_posts = Database :: get_course_table(TABLE_FORUM_POST);
		$post_date = api_get_utc_datetime();
		$my_post_notification = isset($notice) ? $notice : null;
		$visible = 1;

		$return = array();
	
		$sql = "INSERT INTO $table_posts (c_id, post_title, post_text, thread_id, forum_id, poster_id, post_date, post_notification, post_parent_id, visible)
				VALUES (
						".$course_id.",
						'".Database::escape_string($title)."',
						'".Database::escape_string(isset($text) ? ($text) : null)."',
						'".Database::escape_string($thread_id)."',
						'".Database::escape_string($forum_id)."',
						'".$user_id."',
						'".$post_date."',
						'".Database::escape_string(isset($my_post_notification) ? $my_post_notification : null)."',
						'".Database::escape_string(isset($post_parent) ? $post_parent : null)."',
						'".Database::escape_string($visible)."')";
		Database::query($sql);
		$new_post_id = Database::insert_id();
		$sql = "UPDATE $table_posts SET post_id='".$new_post_id."' WHERE iid='".$new_post_id."'";
		Database::query($sql);
		$reply_info['new_post_id'] = $last_post_id;

		// Update the thread.
		$table_threads = Database :: get_course_table(TABLE_FORUM_THREAD);
		$sql = "UPDATE $table_threads SET thread_replies=thread_replies+1,
				thread_last_post='".Database::escape_string($new_post_id)."',
				thread_date='".Database::escape_string($post_date)."'
				WHERE c_id = $course_id AND  thread_id='".Database::escape_string($thread_id)."'"; 
		Database::query($sql);

		// Update the forum.
		api_item_property_update($_course, TOOL_FORUM, $forum_id, 'NewMessageInForum', $user_id);

		// Setting the notification correctly.
		if ($my_post_notification == 1) {
			set_notification('thread', $thread_id, true);
		}

		send_notification_mails($thread_id, $reply_info);
		
		return true;	
	}

}
