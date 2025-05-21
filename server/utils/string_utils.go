package utils

import (
	"strings"
)

// Slugify converts a string to a URL-friendly slug
func Slugify(input string) string {
	// Convert to lowercase
	result := strings.ToLower(input)
	
	// Replace spaces with hyphens
	result = strings.ReplaceAll(result, " ", "-")
	
	// Remove special characters
	var sb strings.Builder
	for _, r := range result {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			sb.WriteRune(r)
		}
	}
	result = sb.String()
	
	// Remove consecutive hyphens
	for strings.Contains(result, "--") {
		result = strings.ReplaceAll(result, "--", "-")
	}
	
	// Trim hyphens from start and end
	result = strings.Trim(result, "-")
	
	// If the result is empty, use a fallback
	if result == "" {
		result = "untitled"
	}
	
	return result
}

// Unslugify attempts to convert a slug back to a human-readable format
// This is just a basic implementation and won't perfectly restore the original string
func Unslugify(slug string) string {
	// Replace hyphens with spaces and capitalize each word
	result := ""
	capitalize := true
	
	for _, char := range slug {
		if char == '-' {
			result += " "
			capitalize = true
		} else {
			if capitalize {
				if char >= 'a' && char <= 'z' {
					result += string(char - 32) // Convert to uppercase
				} else {
					result += string(char)
				}
				capitalize = false
			} else {
				result += string(char)
			}
		}
	}
	
	return result
}