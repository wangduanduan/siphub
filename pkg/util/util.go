package util

import (
	"time"
)

const DayFormat = "2006_01_02"

func ReverseString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func GetDay(days int) string {
	return time.Now().AddDate(0, 0, days).Format(DayFormat)
}
