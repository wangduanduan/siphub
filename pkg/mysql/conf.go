package mysql

const RawTable = `create table if not exists sip_?
(   id int(11) unsigned NOT NULL AUTO_INCREMENT,
    method char(20) NOT NULL DEFAULT '',
    from_user char(40) NOT NULL DEFAULT '',
    from_host char(64) NOT NULL DEFAULT '',
    to_user char(40) NOT NULL DEFAULT '',
    to_user_r char(40) NOT NULL DEFAULT '',
    to_host char(64) NOT NULL DEFAULT '',
    callid char(64) NOT NULL DEFAULT '',
    cseq int(11) NOT NULL,
    protocol int(11) NOT NULL,
    ua char(40) NOT NULL DEFAULT '',
    src_host char(32) NOT NULL DEFAULT '',
    dst_host char(32) NOT NULL DEFAULT '',
    time datetime NOT NULL DEFAULT now(),
    RAW text NOT NULL,
    PRIMARY KEY (id),
    KEY callid (callid),
    KEY method (method),
    KEY src_host (src_host)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;`

const IndexTable = `CREATE TABLE if not exists inv_?
(
    callid char(64) NOT NULL DEFAULT '',
    fs_callid char(64) NOT NULL DEFAULT '',
    protocol int(11) NOT NULL,
    method char(20) NOT NULL DEFAULT '',
    from_user char(40) NOT NULL DEFAULT '',
    from_host char(64) NOT NULL DEFAULT '',
    to_user_r char(40) NOT NULL DEFAULT '',
    to_host char(64) NOT NULL DEFAULT '',
    ua char(40) NOT NULL DEFAULT '',
    src_host char(32) NOT NULL DEFAULT '',
    dst_host char(32) NOT NULL DEFAULT '',
    time datetime NOT NULL DEFAULT now(),
    u_id char(64) NOT NULL DEFAULT '',
    PRIMARY KEY (callid),
    KEY from_host (from_host),
    KEY fs_callid (fs_callid),
    KEY to_host (to_host),
    KEY u_id (u_id),
    KEY time (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8`
