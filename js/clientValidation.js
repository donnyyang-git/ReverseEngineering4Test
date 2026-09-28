/**
 * Client-side validation and enhancement script.
 * Adds complexity to basic form testing by implementing custom checks before submission.
 */

document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.querySelector('form[action="user"]');

    if (userForm) {
        userForm.addEventListener('submit', function(event) {
            // 1. Basic Required Field Check: Prevent submission if username or email is empty.
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();

            if (!username || !email) {
                alert('錯誤：請填寫所有欄位（姓名和電子信箱）！');
                event.preventDefault(); // Stop form submission
                return;
            }

            // 2. Email Format Validation (Regex Check)
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('錯誤：電子信箱的格式有誤，請使用標準的 "user@domain.com" 格式！');
                event.preventDefault(); // Stop form submission
                return;
            }

            // 3. Simple Length/Content Check: Ensure username is not just spaces
            if (username.replace(/\s/g, '').length < 2) {
                alert('錯誤：姓名至少需要兩個非空白字元！');
                event.preventDefault(); // Stop form submission
                return;
            }

            // If all checks pass, allow the default form submission to proceed.
            console.log("Client-side validation passed successfully.");
        });
    }
});