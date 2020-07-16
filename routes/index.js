const express = require('express')
const router = express.Router()
const Job = require('../models/job')

router.get('/', async (req, res) => {
  let jobs
  try {
    jobs = await Job.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    jobs = []
  }
  res.render('index', { jobs: jobs })
})

module.exports = router