const mongoose = require('mongoose')
const Job = require('./job')

const employerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

employerSchema.pre('remove', function(next) {
  Job.find({ employer: this.id }, (err, jobs) => {
    if (err) {
      next(err)
    } else if (jobs.length > 0) {
      next(new Error('This employer has jobs still'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Employer', employerSchema)