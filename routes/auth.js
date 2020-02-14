const router = require('express').Router();
const User = require('../models/User');
const jwt = require ('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { registerValidation, loginValidation } = require('../validation')

// REGISTER USER
router.post('/register', async (req, res) => {

    // lets validate the data before we make an user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

        // checking if the user is already in the db
        const emailExist = await User.findOne({email: req.body.email});
        if(emailExist) return res.status(400).send('Email already exists');

            // hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // create a new user    
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            });

            // handle errors
            try {
                const savedUser = await user.save();
                res.send({ user: user._id });
            } catch (err) {
                res.status(400).send(err);
            }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    // lets validate the data before make an user
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
        // checking if the email exist in the db
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).send('Email or password is wrong');
            // checking password is correct
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if(!validPass) return res.status(400).send('Invalid password');
                // Create and assign a token to user logged in
                const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
                // Send token in the header
                res.header('auth-token', token).send(token);
                res.send('Logged In!');
})

module.exports = router;