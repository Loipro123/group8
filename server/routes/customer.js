const pool = require('../db');
const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/',auth, async(req,res) => {
    try {
        const user = await pool.query(`select name,email,position from customers where email = '${req.user.email}'`);
        res.json({
            user: user.rows[0]
        })
    } catch (error) {
        res.status(500).send('Serve Error')
    }
});

router.post('/login',[
    check('email','Please include a valid email').isEmail(),
    check(
        'password',
        'password is required'
    ).exists()
],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()
        });
    }
    
    const {email,password} = req.body;
    try {
        // See if user exists
        let user = await pool.query(`select * from customers where email='${email}';`);
        if(!user){
            return res.status(400).json({
                errors: [{msg: 'This user is not exist!'}]
            })
        }

        const isMatch = await bcrypt.compare(password,user.rows[0].password);

        if(!isMatch){
            return res
                .status(400)
                .json({errors: [{msg: 'This user is not exist!'}]});
        }
        
          // Encrypt password
        const payload = {
            user: {
                email: user.rows[0].email,
                position: user.rows[0].position
            }
        }
        jwt.sign(
            payload, 
            'group18',
        { expiresIn : 3600},
        (err,token) => {
            if(err) throw err;
            res.json({
                token: token,
                user: user.rows[0]
            })
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
});
router.post('/signup',[
    check('name','Name is required')
    .not()
    .isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a password with 6 or more charaters'
    ).isLength({min: 6})
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()
        });
    }
    
    const {name,email,password} = req.body;
    try {
        // See if user exists
        let user = await pool.query(`select * from customers where email = '${email}';`);
     
        if(user.rows.length >= 1){
            return res.status(400).json({
                errors: [{msg: 'This email is already registed!'}]
            })
        }
        const salt = await bcrypt.genSalt(10);

        const passwordBcrypt = await bcrypt.hash(password, salt);
        await pool.query(`Insert into Customers values('${name}','${email}','${passwordBcrypt}');`);
        let userData = await pool.query(`select name,email,position from customers where email = '${email}';`);
        // Return jsonwebbtoken
        const payload = {
            user: {
                email: userData.rows[0].email,
                position: userData.rows[0].position
            }
        }
        jwt.sign(
            payload, 
            'group18',
        { expiresIn : 3600},
        (err,token) => {
            if(err) throw err;
            res.json({
                token: token,
                user: userData.rows[0]
            })
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router;