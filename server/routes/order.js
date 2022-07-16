const pool = require('../db');
const express = require('express');
const router = express.Router();

router.post('/money',async(req,res)=> {
    const {option} = req.body;
    console.log(req.body)
    try {
        let money;
        if(option === '1'){
            money = await pool.query(`select case when sum(o.quantity * p.price) is Null then 0 else sum(o.quantity * p.price) end from orders o, products p where o.prodid = p.prodid and o.orderdate >=  current_date - interval '1 month'; `)
        }else if(option === '3'){
            money = await pool.query(`select case when sum(o.quantity * p.price) is Null then 0 else sum(o.quantity * p.price) end from orders o, products p where o.prodid = p.prodid and o.orderdate >=  current_date - interval '3 month'; `)
        }else if(option === '6'){
            money = await pool.query(`select case when sum(o.quantity * p.price) is Null then 0 else sum(o.quantity * p.price) end from orders o, products p where o.prodid = p.prodid and o.orderdate >=  current_date - interval '6 month';`)
        }else if(option === '12'){
            money = await pool.query(`select case when sum(o.quantity * p.price) is Null then 0 else sum(o.quantity * p.price) end from orders o, products p where o.prodid = p.prodid and EXTRACT(month FROM o.orderdate) = o.orderdate >=  current_date - interval '12 month'; `)
        }
        else{
            money = await pool.query(`select case when sum(o.quantity * p.price) is Null then 0 else sum(o.quantity * p.price) end from orders o, products p where o.prodid = p.prodid;`)
        }
        res.json({
            money: parseInt(money.rows[0].sum)
        })
    } catch (error) {
        res.status(500).send('Server Errors')
    }
})



module.exports = router;