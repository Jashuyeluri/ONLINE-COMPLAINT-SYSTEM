require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const dummyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Create Admin
    const admin = new User({
      name: 'Admin City',
      email: 'admin@city.com',
      password: 'password123',
      role: 'admin'
    });
    await admin.save();

    // Create Staff
    const staff1 = new User({
      name: 'Ravi Kumar',
      email: 'ravi@staff.com',
      password: 'password123',
      role: 'staff'
    });
    await staff1.save();

    const staff2 = new User({
      name: 'Priya Sharma',
      email: 'priya@staff.com',
      password: 'password123',
      role: 'staff'
    });
    await staff2.save();

    // Create User
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    });
    await user.save();

    // Create Complaints
    const complaints = [
      {
        title: 'Huge Pothole on Maple Ave',
        description: 'Large pothole causing damage to cars. Near the secondary school.',
        category: 'Road',
        location: '123 Maple Ave',
        status: 'Pending',
        createdBy: user._id
      },
      {
        title: 'Street Light Out',
        description: 'The street light has been blinking for a week and finally went out.',
        category: 'Electricity',
        location: 'Park Street Corner',
        status: 'In Progress',
        assignedTo: staff1._id,
        createdBy: user._id
      },
      {
        title: 'Broken Water Pipe',
        description: 'Water is leaking from the main pipe under the sidewalk.',
        category: 'Water',
        location: 'Old Town Square',
        status: 'Resolved',
        createdBy: user._id
      }
    ];

    await Complaint.insertMany(complaints);

    console.log('Dummy data seeded successfully!');
    console.log('Staff accounts: ravi@staff.com / priya@staff.com (password123)');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dummyData();
