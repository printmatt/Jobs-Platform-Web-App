const express = require('express')
const router = express.Router()

// @desc    Landing page
// @route   GET /
router.get('/',(req,res) =>{
    res.render('landing', {
        layout: 'landing'
    })
})

// @desc    Sign Up page
// @route   GET /signup
router.get('/signup',(req,res) =>{
    res.render('signup',
    {
        layout: 'loginsignup'
    })
})

// @desc    Login page
// @route   GET /login
router.get('/login',(req,res) =>{
    res.render('login', {
        layout: 'loginsignup'
    })
})
module.exports = router