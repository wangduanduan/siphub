package log

import (
	"os"
	"sipgrep/pkg/env"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

/* Debugw Infow Warnw Errorw Fatalw Panicw */

var log *zap.SugaredLogger

var Debugf = log.Debugf
var Infof = log.Infof
var Errorf = log.Errorf
var Fatalf = log.Fatalf
var Warnf = log.Warnf

func getLogLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	}
	return zapcore.DebugLevel
}

func initLogger() {

	logLevel := getLogLevel(env.Conf.LogLevel)

	lumberJackLogger := &lumberjack.Logger{
		Filename:   "./logs/" + env.Conf.Hostname + "/app.log",
		MaxSize:    10,
		MaxBackups: 10,
		MaxAge:     7,
		Compress:   false,
	}
	writeSyncer := zapcore.AddSync(lumberJackLogger)
	encoderConf := zap.NewProductionEncoderConfig()
	encoderConf.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConf.EncodeLevel = zapcore.CapitalLevelEncoder
	encoder := zapcore.NewConsoleEncoder(encoderConf)
	fileCore := zapcore.NewCore(encoder, writeSyncer, logLevel)
	consoleCore := zapcore.NewCore(encoder, zapcore.Lock(os.Stdout), logLevel)

	core := zapcore.NewTee(
		fileCore,
		consoleCore,
	)

	logger := zap.New(core, zap.AddCaller())
	log = logger.Sugar()

	Infof = log.Infof
	Errorf = log.Errorf
	Fatalf = log.Fatalf
	Debugf = log.Debugf
	Warnf = log.Warnf
}

func init() {
	initLogger()
}
