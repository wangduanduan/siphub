package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestrEverseString(t *testing.T) {
	successCases := []struct {
		in       string
		expected string
	}{
		{
			in:       "abc",
			expected: "cba",
		},
		{
			in:       "1234",
			expected: "4321",
		},
	}

	for _, item := range successCases {
		out := ReverseString(item.in)
		assert.Equal(t, item.expected, out)
		assert.Equal(t, item.expected, out)
	}
}
