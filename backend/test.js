async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Akash', password: 'password123' })
    });
    const data = await res.json();
    console.log('Login:', data);

    if (data.token) {
      const res2 = await fetch('http://localhost:5000/api/campaigns/join', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({ points: 500 })
      });
      console.log('Join status:', res2.status);
      const data2 = await res2.json();
      console.log('Join response:', data2);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
