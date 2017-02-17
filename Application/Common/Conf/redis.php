<?php
return [/* 系统redis缓存 */
	'DATA_CACHE_TYPE' 	=> 'Redis',
	'REDIS_PORT' 		=> 6379,
    'REDIS_HOST' 		=> '192.168.1.210',
    'REDIS_AUTH' 		=> '',
	'DATA_CACHE_PREFIX' => 'jttravel_',		//缓存key前缀
	'DATA_CACHE_TIME' 	=> 3600,			//缓存默认生存时间
];
