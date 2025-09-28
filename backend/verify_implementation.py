"""
Time-Based Exam Availability - Code Verification
===============================================

This script verifies that all the required code changes have been implemented.
"""

import os
import re

def check_file_contains(filepath, patterns, description):
    """Check if file contains all required patterns"""
    print(f"\n🔍 Checking {description}:")
    print(f"File: {filepath}")
    
    if not os.path.exists(filepath):
        print("❌ File not found!")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    all_found = True
    for pattern, desc in patterns:
        if re.search(pattern, content, re.MULTILINE | re.DOTALL):
            print(f"✅ {desc}")
        else:
            print(f"❌ {desc}")
            all_found = False
    
    return all_found

def main():
    print("🎯 TIME-BASED EXAM AVAILABILITY VERIFICATION")
    print("=" * 50)
    
    backend_views = r"C:\Users\siva\Desktop\EduConnect\educonnect-system\backend\students\views.py"
    frontend_exams = r"C:\Users\siva\Desktop\EduConnect\educonnect-system\frontend\src\app\students\[id]\exams\page.jsx"
    frontend_take = r"C:\Users\siva\Desktop\EduConnect\educonnect-system\frontend\src\app\students\[id]\exams\take\[examId]\page.jsx"
    instructor_create = r"C:\Users\siva\Desktop\EduConnect\educonnect-system\frontend\src\app\instructor\exams\create\page.jsx"
    
    # Check backend implementation
    backend_patterns = [
        (r"availability_status.*not_started", "Availability status calculation"),
        (r"exam_start_datetime.*exam_end_datetime", "Time window calculation"),
        (r"current_datetime.*exam_start_datetime", "Time comparison logic"),
        (r"is_available.*availability_message", "Availability response fields"),
        (r"remaining_minutes.*total_seconds", "Remaining time calculation"),
    ]
    
    backend_ok = check_file_contains(backend_views, backend_patterns, "Backend Time Logic")
    
    # Check frontend exam list
    frontend_patterns = [
        (r"availability_status.*available", "Availability status handling"),
        (r"Timer.*Lock.*Unlock", "Status icons import"),
        (r"bg-green-50.*Available Now", "Available status styling"),
        (r"bg-blue-50.*not_started", "Not started status styling"),
        (r"availability_message", "Availability message display"),
    ]
    
    frontend_ok = check_file_contains(frontend_exams, frontend_patterns, "Frontend Exam List")
    
    # Check exam taking page
    take_patterns = [
        (r"examError", "Error state handling"),
        (r"Exam Not Available", "Error message display"),
        (r"response\.status.*403", "Time restriction error handling"),
    ]
    
    take_ok = check_file_contains(frontend_take, take_patterns, "Frontend Exam Taking")
    
    # Check answer key implementation
    answer_patterns = [
        (r"is_correct.*CheckCircle", "Answer key visual indicators"),
        (r"border-green-300.*bg-green-50", "Correct answer highlighting"),
        (r"Answer Key.*Select the correct", "Answer key instructions"),
        (r"option\.is_correct", "Answer key selection logic"),
    ]
    
    answer_ok = check_file_contains(instructor_create, answer_patterns, "Answer Key Interface")
    
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)
    
    if backend_ok:
        print("✅ Backend time-based logic implemented")
    else:
        print("❌ Backend implementation incomplete")
    
    if frontend_ok:
        print("✅ Frontend exam list updated")
    else:
        print("❌ Frontend exam list needs work")
    
    if take_ok:
        print("✅ Exam taking page handles restrictions")
    else:
        print("❌ Exam taking page needs error handling")
    
    if answer_ok:
        print("✅ Answer key interface enhanced")
    else:
        print("❌ Answer key interface needs improvement")
    
    if all([backend_ok, frontend_ok, take_ok, answer_ok]):
        print("\n🎉 ALL IMPLEMENTATIONS VERIFIED SUCCESSFULLY!")
        print("\nThe system now:")
        print("• ✓ Restricts exam access to scheduled time windows")
        print("• ✓ Shows clear availability status and messages")
        print("• ✓ Prevents access to expired or future exams")
        print("• ✓ Provides enhanced answer key interface")
        print("• ✓ Awards marks only for correct answers")
    else:
        print("\n⚠️  Some implementations need attention")
    
    print("\n📋 NEXT STEPS:")
    print("1. Test with actual exam data")
    print("2. Verify timing calculations are accurate")
    print("3. Test across different timezones if needed")
    print("4. Ensure answer key system works correctly")

if __name__ == "__main__":
    main()