
# Mental Health Chatbot

### Description
The Mental Health Chatbot is a MERN Stack application designed to assist users in managing their mental health. Users can sign up, log in, and interact with the chatbot to receive mental health support and book therapy sessions at available slots. This project was developed for the university wellness center, offering a platform for students to seek help and engage with professional therapists. The chatbot leverages modern web technologies to provide a responsive and helpful mental health support system.

### Features
- **User Authentication**: Sign up and login functionality to ensure secure access.
- **Chatbot Interaction**: Users can converse with a chatbot for mental health guidance and initial support.
- **Therapy Booking**: Users can book therapy sessions at available time slots with qualified therapists.
- **Admin Panel**: Admins can manage available therapy slots, monitor user interactions, and ensure quality control.
- **Responsive Design**: Works across devices for seamless user experience.
- **Data Analytics Potential**: Tracks user interactions and can provide insights into mental health trends.

### Technologies Used
- **MySQL**: For storing user data and session information.
- **Express.js**: Backend framework handling API requests.
- **React.js**: Frontend framework for the user interface and chatbot interaction.
- **Node.js**: Server-side environment.
- **Google Gemini AI**: For chatbot intelligence and responses.
- **JWT Authentication**: For secure user sign-up and login.

### Installation Instructions

**Chi tiết đầy đủ xem file [SETUP_GUIDE.md](SETUP_GUIDE.md)**

#### Tóm tắt nhanh:

1. **Cài đặt MySQL:**
    - Tải XAMPP: https://www.apachefriends.org/
    - Hoặc MySQL: https://dev.mysql.com/downloads/mysql/

2. **Tạo database:**
    ```bash
    # Mở MySQL và chạy file Backend/database.sql
    mysql -u root
    source Backend/database.sql
    ```

3. **Cấu hình API Key:**
    - Lấy Google Gemini API key: https://makersuite.google.com/app/apikey
    - Tạo file `Backend/.env`:
    ```
    API_KEY=your_google_gemini_api_key
    ```

4. **Cài đặt dependencies:**
    ```bash
    cd Backend
    npm install
    cd ../chatbot
    npm install
    cd ../mobile
    npn install
    npx expo install expo-linear-gradient
    ```

5. **Chạy project:**
    ```bash
    # Terminal 1 - Backend
    cd Backend
    npm start
    
    # Terminal 2 - Frontend wed
    cd chatbot
    npm start
   

    # Terminal 3 - Frontend mobile
    cd mobile
    npx expo start (npm start)
    (tải expo go trên dien thoai, quet ma)
 ```


6. **Truy cập:** http://localhost:3000

### Usage
- Visit the web application and sign up as a user.
- Log in and start interacting with the chatbot for mental health support.
- Book therapy sessions with available therapists based on the slots shown.
- Admins can manage user interactions and session availability through the admin panel.

### Future Enhancements
- Incorporating AI-driven sentiment analysis for better chatbot responses.
- Enhancing the booking system with reminders and integration with calendar apps.
- Implementing data analytics for better insights into user mental health trends.

### Contact
For any queries or contributions, feel free to reach out to me:
- **Author**: Byas Yadav
- **Email**: byasyadav371@example.com

### Snapshots
![image](https://github.com/user-attachments/assets/dff3860f-7874-48d5-80f0-51de590c003a)

![image](https://github.com/user-attachments/assets/3465e21a-9722-4a53-ad5a-7a1c2b85487a)

![image](https://github.com/user-attachments/assets/3461eb17-e8bf-4331-8b64-94856f3fc718)



