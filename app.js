const users = JSON.parse(localStorage.getItem('users')) || [];

// Проверяем, есть ли администратор, если нет — создаем
if (!users.some(user => user.email === 'admin@test.ru')) {
    users.push({
        fullName: 'Admin',
        birthDate: '2000-01-01',
        phone: '1234567890',
        username: 'admin',
        email: 'admin@test.ru',
        password: '123456789',
        role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
}

// скрытие/показ модалок авторизации и регистрации 
const goToRegister = document.querySelector('.button-go-register')
const goToLogin = document.querySelector('.button-go-login')
const authModal = document.querySelector('.auth__modal')
const registerModal = document.querySelector('.auth__register')

goToRegister.addEventListener('click', ()=>{
  authModal.classList.add('none')
  registerModal.classList.remove('none')
})

goToLogin.addEventListener('click', ()=> {
  authModal.classList.remove('none')
  registerModal.classList.add('none')
})

// Авторизация пользователя
document.getElementById('loginBtn').addEventListener('click', login);

function login() {  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const user = users.find(user => user.email === email && user.password === password);

  if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'kanban.html'
  } else {
      console.log('Неверная электронная почта или пароль!');
  }
}

function validateForm(fullName, birthDate, phone) {

}
//Регистрация нового пользователя
document.getElementById('registerBtn').addEventListener('click', register);

function register() {
    const fullName = document.getElementById('fullName').value;
    const birthDate = document.getElementById('birthDate').value;
    const phone = document.getElementById('phone').value;
    const username = document.getElementById('username').value;
    const regEmail = document.getElementById('regEmail').value;
    const regPassword = document.getElementById('regPassword').value;
    const message = document.getElementById('regMessage');
    const regPosition = document.getElementById('position').value

    if (users.some(user => user.email === regEmail)) {
        message.textContent = 'Пользователь с этой электронной почтой уже существует!';
        return;
    }
    console.log('click');
    
    console.log(regPosition);
    
    users.push({
        fullName,
        birthDate,
        phone,
        username,
        email: regEmail,
        password: regPassword,
        role: regPosition
    });
    localStorage.setItem('users', JSON.stringify(users));
    message.textContent = 'Регистрация успешна!';
}
