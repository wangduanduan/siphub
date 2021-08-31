package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"net"
	"siphub/pkg/env"
	"siphub/pkg/log"
	"siphub/pkg/msg"
	"siphub/pkg/mysql"
	"time"
)

type app struct {
	record *mysql.Record
}

func (p *app) OnMessage(b []byte) {
	sip, err := msg.Format(b)
	if err != nil {
		log.Infof("format msg error: %v", err)
		return
	}

	_, err = p.record.Save(sip)

	if err != nil {
		log.Infof("write db error: %v", err)
		return
	}
}

func initDB(dbUserPasswd, dbAddr, dbName string) (*sql.DB, error) {
	dbInfo := fmt.Sprintf("%s@tcp(%s)/%s?parseTime=true&loc=Local", dbUserPasswd, dbAddr, dbName)
	db, err := sql.Open("mysql", dbInfo)

	if err != nil {
		return db, err
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(env.Conf.SqlMaxOpenConn)
	db.SetMaxOpenConns(env.Conf.SqlMaxOpenConn)

	err = db.Ping()
	if err != nil {
		return db, err
	}

	log.Infof("connect db: %s/%s succss", dbAddr, dbName)
	return db, nil
}

func main() {

	db, err := initDB(env.Conf.DBUserPasswd, env.Conf.DBAddr, env.Conf.DBName)

	if err != nil {
		log.Fatalf("connect db: %s/%s error", env.Conf.DBAddr, env.Conf.DBName)
	}

	defer db.Close()

	App := &app{
		record: &mysql.Record{DB: db},
	}

	conn, err := net.ListenUDP("udp", &net.UDPAddr{Port: env.Conf.UDPListenPort})
	if err != nil {
		log.Fatalf("Udp Service listen report udp fail:%v", err)
	}
	log.Infof("create udp success")
	defer conn.Close()
	var data = make([]byte, env.Conf.MaxPackgeLength)
	var raw []byte
	for {
		conn.SetDeadline(time.Now().Add(time.Duration(env.Conf.MaxReadTimeoutSeconds) * time.Second))
		n, remoteAddr, err := conn.ReadFromUDP(data)

		if err != nil {
			if opErr, ok := err.(*net.OpError); ok && opErr.Timeout() {
				continue
			} else {
				log.Errorf("read udp error: %v, from %v", err, remoteAddr)
			}
		}

		raw = make([]byte, n)
		copy(raw, data[:n])
		go App.OnMessage(raw)
	}

}
