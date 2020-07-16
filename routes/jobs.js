const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const Employer = require("../models/employer");
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

// All jobs Route
router.get("/", async (req, res) => {
  let query = Job.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const jobs = await query.exec();
    res.render("jobs/index", {
      jobs: jobs,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// New job Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Job());
});

// Create job Route
router.post("/", async (req, res) => {
  const job = new Job({
    title: req.body.title,
    employer: req.body.employer,
    publishDate: new Date(req.body.publishDate),
    salary: req.body.salary,
    description: req.body.description,
  });
  saveCover(job, req.body.cover);

  try {
    const newJob = await job.save();
    res.redirect(`jobs/${newJob.id}`);
  } catch {
    renderNewPage(res, job, true);
  }
});

// Show job Route
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer").exec();
    res.render("jobs/show", { job: job });
  } catch {
    res.redirect("/");
  }
});

// Edit job Route
router.get("/:id/edit", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    renderEditPage(res, job);
  } catch {
    res.redirect("/");
  }
});

// Update job Route
router.put("/:id", async (req, res) => {
  let job;

  try {
    job = await Job.findById(req.params.id);
    job.title = req.body.title;
    job.employer = req.body.employer;
    job.publishDate = new Date(req.body.publishDate);
    job.salary = req.body.salary;
    job.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(job, req.body.cover);
    }
    await job.save();
    res.redirect(`/jobs/${job.id}`);
  } catch {
    if (job != null) {
      renderEditPage(res, job, true);
    } else {
      redirect("/");
    }
  }
});

// Delete job Page
router.delete("/:id", async (req, res) => {
  let job;
  try {
    job = await Job.findById(req.params.id);
    await job.remove();
    res.redirect("/jobs");
  } catch {
    if (job != null) {
      res.render("jobs/show", {
        job: job,
        errorMessage: "Could not remove job",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, job, hasError = false) {
  renderFormPage(res, job, "new", hasError);
}

async function renderEditPage(res, job, hasError = false) {
  renderFormPage(res, job, "edit", hasError);
}

async function renderFormPage(res, job, form, hasError = false) {
  try {
    const employers = await Employer.find({});
    const params = {
      employers: employers,
      job: job,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating job";
      } else {
        params.errorMessage = "Error Creating job";
      }
    }
    res.render(`jobs/${form}`, params);
  } catch {
    res.redirect("/jobs");
  }
}

async function saveCover(job, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    job.coverImage = new Buffer.from(cover.data, "base64");
    job.coverImageType = cover.type;
  }
}

module.exports = router;
