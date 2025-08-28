import axios from 'axios';

export async function addVendor({ name, phone, email, address, gender }) {
  const payload = {
    name,
    phone,
    email,
    address,
    gender,
    isCabVendor: true,
    roles: '68aeb7d8dcee476cf3cae52d',
  };
  const response = await axios.post('/api/v0/employee', payload);
  return response.data;
}
