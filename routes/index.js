var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const url = process.env.MONGOURL
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(success => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>")
    console.info('connected to the database..')
}).catch(e => {
    console.info('fail to connect..')
    console.log(e)
})

var jobs = mongoose.model('ToDoList', {
    text: String,
    user: String,
    completed: Boolean
}, "ToDoList");

var customers = mongoose.model('Customers', {
    name: String,
    email: String,
    image_url: String,
    userid: String
}, "Customers");


// hello world...
router.get('/hello', (req, res) => {
    res.send("nodejs - Hello world.")
})

// get unique user
router.get('/api/user/:user', (req, res) => {
    var userid = req.params.user
    customers.findOne({ userid: userid }).then(resp => {
        resp == null ? res.json({ found: false }) : res.json({ found: true, result: resp })
    }).catch(err => {
        res.send({ status: "error", result: err })
    })
});

//  create customer
router.post('/api/user', (req, res) => {

    var customertocreate = {
        name: req.body.name,
        email: req.body.email,
        image_url: req.body.image_url,
        userid: req.body.userid
    }
    customers.create(customertocreate, (err, cust) => {
        if (err) {
            res.send({ status: "error", result: err });
        } else {
            customers.findById(cust._id, (err, customer) => {
                if (err)
                    res.send({ status: "error", result: err })
                res.json({ status: "ok", result: customer });
            });
        }
    })
});

// get all jobs
router.get('/api/jobs', (req, res) => {
    var user = req.headers.userid
    console.log(">>>>>>>>>>>>>>>")
    console.log(req.headers.userid)
    jobs.find({ user: user }, (err, job) => {
        if (err) {
            res.send(err)
            console.log(err)

        }
        res.json({ status: "ok", result: job });
    });
});

//  create job
router.post('/api/jobs', (req, res) => {
    // console.log(req)
    var user = req.headers.userid
    var text = req.body.text
    var jobToAdd = {
        text: text,
        user: user,
        completed: false
    }

    console.log(jobToAdd)

    jobs.create(jobToAdd, (err, job) => {
        if (err) {
            res.send({ status: "error", result: err });
        } else {
            jobs.find({ user: req.headers.userid }, (err, job) => {
                if (err)
                    res.send({ status: "error", result: err })
                res.json({ status: "ok", result: job });
            });
        }

    })
});

// delete job
router.delete('/api/jobs/:jobid', (req, res) => {
    var user = req.headers.userid
    var id = req.params.jobid
    jobs.remove({ _id: id }, (err, job) => {
        if (err) {
            res.send({ status: "error", result: err });
        } else {
            jobs.find({ user: req.headers.userid }, (err, job) => {
                if (err)
                    res.send({ status: "error", result: err })
                res.json({ status: "ok", result: job });
            });
        }

    })
});

// get unique job
router.get('/api/jobs/:jobid', (req, res) => {
    var user = req.headers.userid
    var id = req.params.jobid
    jobs.findById(id).then(resp => {
        res.json({ status: "ok", result: resp })
    }).catch(err => {
        res.send({ status: "error", result: err })
    })
});

//update job
router.put('/api/jobs/:jobid', (req, res) => {
    var user = req.headers.userid
    var id = req.params.jobid
    var text_ = req.body.text
    var status = req.body.status ? false : true

    jobs.findById(id).then(resp => {
        resp.text = text_;
        resp.completed = status;
        resp.save((err, resp) => {
            if (err)
                res.send({ status: "error", result: err });
            res.json({ status: "ok", result: resp });
        });
    }).catch(err => {
        res.send({ status: "error", result: err })
    })
});
// 
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;