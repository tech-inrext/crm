import axios from 'axios';

export async function addVendor({ name, phone, email, address }) {
  const payload = {
    name,
    phone,
    email,
    address,
    isCabVendor: true,
    roles: '68aeb7d8dcee476cf3cae52d',
  };

  // Ensure cookies (session/auth) are sent so server middleware can authenticate
  const response = await axios.post('/api/v0/employee', payload, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}
