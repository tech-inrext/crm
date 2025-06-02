import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { name, description, permissions } = req.body;

      // Basic Validation
      if (!name || permissions.length === 0) {
        return res.status(400).json({ success: false, message: 'Role name and permissions are required.' });
      }

      const newRole = new Role({
        name,
        description,
        permissions
      });

      await newRole.save();
      return res.status(201).json({ success: true, data: newRole });
    } catch (error) {
      console.error('Role Creation Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const roles = await Role.find({});
      return res.status(200).json({ success: true, data: roles });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch roles', error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
