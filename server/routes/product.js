const pool = require('../db');
const express = require('express');
const router = express.Router();
// const {check,validationResult} = require('express-validator');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const auth = require('../middleware/auth');


router.post('/total',async(req,res)=> {
    const {option} = req.body;
    console.log(req.body)
    try {
        let products;
        if(option === 'total'){
            products = await pool.query('select count(prodid) from products;')
        }
        else{
            products = await pool.query(`select count(prodid) from products p,company c where p.compid = c.compid and c.name = '${option}';`)
        }
        res.json({
            count: parseInt(products.rows[0].count)
        })
    } catch (error) {
        res.status(500).send('Server Errors')
    }
})

router.get('/company',async(req,res)=> {
    try {
        let company= await pool.query(`select name from company;`)
        res.json({
            company: company.rows
        })
    } catch (error) {
        res.status(500).send('Server Errors')
    }
})

router.get('/',async(req,res)=> {
    try {
        const products = await pool.query('select * from products;')
        res.json({
            products: products.rows
        })
    } catch (error) {
        res.status(500).send('Server Errors')
    }
})

router.get('/monthSale',async(req,res)=> {
    try {
        const products = await pool.query('select p.name, EXTRACT(month FROM o.orderdate) as month,sum(o.quantity) as quantity from orders o, products p where o.prodid = p.prodid and EXTRACT(year FROM o.orderdate) = EXTRACT(year FROM current_date) group by o.prodId,p.name,o.orderdate order by o.prodid, EXTRACT(month FROM o.orderdate);')
        const series = [];
        // products.rows.forEach(item => {
        //     let check = false;
        // })
        products.rows.forEach(item => {
            let check = false;
            for(let i = 0; i < series.length; i++){
                if(series[i].name === item.name){
                    series[i].data[parseInt(item.month) - 1] = series[i].data[parseInt(item.month) - 1] + parseInt(item.quantity);
                    check = true;
                    break;
                }
            }
            if(check === false){
                const d = new Date();
                let month = d.getMonth() + 1;
                series.push({
                    name: item.name,
                    data: Array(month).fill(0)
                })
                for(let i = 0; i < series.length; i++){
                    if(series[i].name === item.name){
                        series[i].data[parseInt(item.month) - 1] = parseInt(item.quantity)
                        break;
                    }
                }
            }
           
        })
        res.json({
            sales: series
        })
    } catch (error) {
        res.status(500).send('Server Errors')
    }
})



module.exports = router;