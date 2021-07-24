package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
	"os"
	"siphub/config"
)

/* Debugw Infow Warnw Errorw Fatalw Panicw */

var Log *zap.SugaredLogger

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

	logLevel := getLogLevel(config.Conf.LogLevel)

	lumberJackLogger := &lumberjack.Logger{
		Filename:   "./logs/" + config.Conf.Hostname + "/app.log",
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
	Log = logger.Sugar()
}

func init() {
	initLogger()
}
