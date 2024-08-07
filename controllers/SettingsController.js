const mongoose = require('mongoose');
const User = require('../models/user');

const bcrypt = require('bcryptjs');

exports.updateUserSettings = async (req, res) => { //this is corrently only the name and stuff 
    const userId = req.session.userId;
    const { firstName, lastName, password } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.password = password || user.password;
       // user.profilePicture = user.profilePicture;
        await user.save();
        res.status(200).send('User updated successfully');
    } catch (error) {
        res.status(500).send('Error updating user');
    }
};

exports.updateUser = async (req, res) => {
    const userId = req.session.userId;
    
    //Destructure only the fields that may be updated
    const { firstName, lastName, bio, address, password } = req.body;
    
    try {
        //Find user by ID
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
      
      
        //Update user fields if they are provided
        
        user.firstName = firstName;
        
        user.lastName = lastName;
        
        user.bio = bio;
        
        user.address = address;
        
        //user.email = email;
        
        //hash password so itll be sec 
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        //save user
        await user.save();

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Error updating user' });
    }
};

exports.getUserDetails = async (req, res) => {
    const userId = req.session.userId;

    try {
        //Fetch user details from MongoDB
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //Extract relevant user details
        const userDetails = {
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            address: user.address,
            email: user.email,
            profilePicture: user.profilePicture //ptionally add profile picture
        };

        res.status(200).json(userDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserName = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId, 'firstName lastName');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ firstName: user.firstName, lastName: user.lastName });
    } catch (error) { /// very cool multi value json lol Also its kinda complex  
        
        res.status(500).json({ error: error.message });
    }
};
exports.getAccessLevel = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId, 'access');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ access: user.access });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAccessLevel = async (req, res) => {
    try {
        const { email, access } = req.query;
        console.log(email, access);
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.access = access || user.access;
        await user.save();
        res.status(200).json({ message: 'Access level updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating access level' });
    }
};
/* old g code 
// Get first name
exports.getFirstName = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'firstName');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ firstName: user.firstName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get last name
exports.getLastName = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'lastName');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ lastName: user.lastName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get bio
exports.getBio = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'bio');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ bio: user.bio });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get address
exports.getAddress = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'address');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ address: user.address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get email
exports.getEmail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ email: user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get password
exports.getPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, 'password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ password: user.password });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
*/