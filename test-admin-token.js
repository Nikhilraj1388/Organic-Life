// fetch is built-in in Node 18+

async function getAdminToken() {
  try {
    // Register admin
    const registerResponse = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPass123',
        name: 'Admin User',
        role: 'admin'
      })
    });
    console.log('Register response:', await registerResponse.json());

    // Login
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPass123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    console.log('Token:', loginData.token);
  } catch (error) {
    console.error('Error:', error);
  }
}

getAdminToken();
