<?php
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
			$info = CourseManager::get_course_information_by_id($course['real_id']);
			$infoCourse = api_format_course_array($info);

			$teacher = CourseManager::get_teacher_list_from_course_code_to_string($infoCourse['code']);

            $store_path = api_get_path(SYS_COURSE_PATH).$infoCourse['path'];
            $url_picture = $store_path.'/course-pic85x85.png';

            if (!file_exists($url_picture)) {
                $url_picture = '';
            }else{
				$url_picture = api_get_path(WEB_COURSE_PATH).$infoCourse['path'].'/course-pic85x85.png';
			}
			
			$courses[] = array(
                'id' => $infoCourse['real_id'],
                'title' => $infoCourse['title'],
                'code' => $infoCourse['code'],
                'directory' => $infoCourse['directory'],
				'url_picture' => $url_picture,
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
		$user = UserManager::get_user_info_by_id($user_id);
		
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
		
		$t_uf  = Database :: get_main_table(TABLE_MAIN_USER_FIELD);
	    $t_ufv = Database :: get_main_table(TABLE_MAIN_USER_FIELD_VALUES);
		$extra = array();
		
		$sql = "SELECT field_display_text,field_value "
              ." FROM $t_uf a INNER JOIN $t_ufv b ON a.id=b.field_id "
			  ." WHERE a.field_visible='1' AND b.user_id='".$user_id."' AND b.field_value<>'';";
        $rs = Database::query($sql);
		while( $row = Database::fetch_row($rs) ) {
			$extra[] = $row;
		}
		$user['extra'] = $extra;
		
		$img_array = UserManager::get_user_picture_path_by_id($user_id, 'web', true, true);
		$user['picture_uri'] = $img_array['dir'].$img_array['file'];
		
		return $user;
    }
	
	/**
     * Get description of course
     * @param int $c_id The id course
     * @return array the all descriptions
     */
    public function getDescription($c_id)
    {
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
     * Get documents of course
     * @param int $c_id The id course
     * @return array the all documents
     */
    public function getDocuments($c_id, $path)
    {	
		$lib_path = api_get_path(LIBRARY_PATH);
		require_once $lib_path.'fileDisplay.lib.php';
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$_course = CourseManager::get_course_information_by_id($c_id);
				
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
									'title' => $document['title'],
									'icon' => $icon,
									'size' => $document['size']);
			}
		}
		return $results;
    }
	
	/**
     * Get announcements of course
     * @param int $c_id The course id
	 * @param int $user_id 
     * @return array the all announcements
     */
    public function getAnnouncements($c_id, $user_id)
    {
		global $_configuration;
		$ruta = $_configuration['root_web'];
		
		$tbl_announcement = Database::get_course_table(TABLE_ANNOUNCEMENT);
        $tbl_item_property = Database::get_course_table(TABLE_ITEM_PROPERTY);

        if (!empty($user_id) && is_numeric($user_id)) {
            $user_id = intval($user_id);
            $sql = "SELECT announcement.c_id, announcement.id, announcement.title, announcement.content, toolitemproperties.insert_user_id,toolitemproperties.lastedit_date ".
					"FROM $tbl_announcement announcement, $tbl_item_property toolitemproperties ".
					"WHERE ".
						"announcement.c_id = $c_id AND ".
						"toolitemproperties.c_id = $c_id AND ".
						"announcement.id = toolitemproperties.ref AND ".
						"toolitemproperties.tool='announcement' AND ".
						"( ".
						  "toolitemproperties.to_user_id='$user_id' AND ".
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
					$info_user = UserManager::get_user_info_by_id($myrow['insert_user_id']);
                   $result[] = array(
				   	   'c_id' => $myrow['c_id'],
					   'a_id' => $myrow['id'],
					   'title' => $myrow['title'],
					   'content' => str_replace('src="/','src="'.$ruta,$myrow['content']),
					   'teacher' => $info_user['firstname'].' '.$info_user['lastname'], 
					   'last_edit' => date("d-m-Y H:i:s",strtotime($myrow['lastedit_date']))
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
		
        $courseInfo = CourseManager::get_course_information_by_id($course_id);
        $course_id = $courseInfo['real_id'];
        $user_id = intval($user_id);
        $session_id = intval($session_id);
        $group_memberships = GroupManager::get_group_ids($course_id, $user_id);
        
        $tlb_course_agenda = Database::get_course_table(TABLE_AGENDA);
        $tbl_property = Database::get_course_table(TABLE_ITEM_PROPERTY);

        if (is_array($group_memberships) && count($group_memberships) > 0) {
            $where_condition = "( ip.to_user_id = $user_id OR ip.to_group_id IN (0, ".implode(", ", $group_memberships).") ) ";

            $sql = "SELECT DISTINCT agenda.*
                    FROM $tlb_course_agenda agenda
                    INNER JOIN $tbl_property ip
                    ON (agenda.id = ip.ref AND agenda.c_id = ip.c_id)
                    WHERE
                        ip.tool         ='".TOOL_CALENDAR_EVENT."' AND
                        $where_condition AND
                        ip.visibility   = '1' AND
                        agenda.c_id     = $course_id AND
                        ip.c_id         = $course_id
                    ";
        } else {
            $visibilityCondition = " ip.visibility='1' AND";
            $where_condition = " ( ip.to_user_id = $user_id OR ip.to_group_id='0' ) AND ";

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
                        ip.id_session = $session_id
                    ";
        }

        $result = Database::query($sql);
        if (Database::num_rows($result)) {
            $results = array();
            
            while ($row = Database::fetch_array($result, 'ASSOC')) {
				$results[] = array(
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
		$courseInfo = CourseManager::get_course_information_by_id($course_id);
		$course_code = $courseInfo['code'];
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);
		
		/* TRACKING */
		//event_access_tool(TOOL_FORUM);
		global $TABLETRACK_ACCESS;
		$id_session    = 0;
		$tool          = Database::escape_string(TOOL_FORUM);
		$reallyNow     = api_get_utc_datetime();

		$sql = "INSERT INTO ".$TABLETRACK_ACCESS."
        			(access_user_id,
        			 access_cours_code,
        			 access_tool,
        			 access_date,
        			 access_session_id
        			 )
        		VALUES
        			(".$user_id.",".// Don't add ' ' around value, it's already done.
        			"'".$course_code."' ,
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
		$courseInfo = CourseManager::get_course_information_by_id($c_id);
		$course_code = $courseInfo['code'];
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
				
		$courseInfo = CourseManager::get_course_information_by_id($c_id);
		$course_code = $courseInfo['code'];
		Login::init_user($user_id, true);
		Login::init_course($course_code, true);
		$post_list = get_posts($thread_id);
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
		Login::init_user($user_id, true);
		Login::init_course($c_id, true);
		
		$table_threads = Database :: get_course_table(TABLE_FORUM_THREAD);
    	$table_posts = Database :: get_course_table(TABLE_FORUM_POST);
		
		$course_id = $c_id;
		$courseInfo = CourseManager::get_course_information_by_id($course_id);
		$user = UserManager::get_user_info_by_id($user_id);
		
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
		
		Login::init_user($user_id, true);
		$course_id = $c_id;
		$_course = CourseManager::get_course_information_by_id($course_id);
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
	
	
	/**
     * Get ranking of course
     * @param int $c_id The id course
     * @return array the ranking
     */
    public function getRanking($c_id)
    {
		global $_configuration;
		$ruta = $_configuration['root_web'];
				
		$libpath = api_get_path(LIBRARY_PATH);
		require_once $libpath.'course_description.lib.php';
        
		require_once __DIR__ . '/../../ranking/src/ranking.lib.php';
		require_once __DIR__ . '/../../../main/inc/global.inc.php';
		require_once __DIR__ . '/../../ranking/src/ranking_plugin.class.php';
		
		//api_protect_course_script(true);
		$plugin = RankingPlugin::create();
		$course_id = $c_id;
		
		//Se actualiza los resultados al entrar en esta página?
		if($plugin->get('time_execution') == "true"){
			//SI
			//Por tiempo toca actualizar las puntuaciones?
			if(checkTimeUpdate($plugin->get('time_refresh'),$course_id)){
				//SI
				//Borrar registros en la tabla de los usuarios/curso
				DeleteCourseScore($course_id);
				
				//Recorrer usuario por usuario las puntuaciones en las herramientas habilitadas
				AddScoreUsers($course_id);
			}
		}
		
		// Leer Datos y Mostrar tabla
		$info_score = showScoreUser($course_id);
		
		return $info_score;
    }
	
	public function getDetailsRanking($c_id, $user_id)
	{
		require_once __DIR__ . '/../../ranking/config.php';
		require_once __DIR__ . '/../../ranking/src/ranking.lib.php';
		
		$plugin = RankingPlugin::create();
		
		$course_id = $c_id;
		$tableScoreUsers = Database::get_main_table(TABLE_RANKING_SCORE_USERS);
		$tableTools = Database::get_main_table(TABLE_RANKING_TOOLS);
		
		$sql = "SELECT tool, score, participations 
				FROM $tableScoreUsers a LEFT JOIN $tableTools b ON a.tool_id=b.id 
				WHERE user_id='".$user_id."' AND c_id='".$course_id."'
				ORDER BY tool_id ASC;";
				
		$rs = Database::query($sql);
		if(Database::num_rows($rs)>0){
			$content = '<table class="table-striped" width="100%">';
				$content .= '<tr class="row_odd">';
					$content .= '<th class="bg-color">'.$plugin->get_lang('Tool').'</th>';
					$content .= '<th class="ta-center bg-color">'.$plugin->get_lang('Score').'</th>';
				$content .= '</tr>';
			while ($row = Database::fetch_assoc($rs)) {
				if($i%2 == 0){
					$content .= '<tr class="row_even">';
				}else{
					$content .= '<tr class="row_odd">';
				}
				$i = $i + 1;
				$content .= '<td class="ta-center">'.$plugin->get_lang($row['tool']).'</td>';
				$content .= '<td class="ta-center">'.$row['score'].'</td>';
				$content .= '</tr>';
			}
			$content .= '</table>';
		}else{
			$content = $plugin->get_lang('NoResult');
		}
		return $content;	
	}
	
}
