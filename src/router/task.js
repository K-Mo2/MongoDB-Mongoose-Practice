const { main } = require("../database/mongoose");
const taskSchema = require("../models/tasks");
const express = require("express");

const router = new express.Router();

router.get("/tasks", (req, res) => {
  main("tasks", taskSchema).then((data) => {
    data.find({}).then((result) => {
      if (!result) {
        res.status(404).send("Not Found");
      }
      res.status(201).send(result);
    });
  });
});

router.post("/tasks", (req, res) => {
  main("tasks", taskSchema, req.body)
    .then((data) => {
      data.save();
      res.status(201).send(data);
    })
    .catch((error) => res.status(400).send(error));
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const updates = Object.entries(req.body);
    const allowedUpdates = ["task", "completed"];
    const updateIsAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateIsAllowed) {
      return res.status(400).send(new Error("Error: Invalid update"));
    }

    const id = req.params.id;
    const modelInstance = await main("tasks", taskSchema);

    const result = await modelInstance.findById(id);
    updates.forEach((update) => (result[update] = req.body[update]));
    await result.save();

    !result
      ? res.status(404).send(new Error("Not Found"))
      : res.status(201).send(result);
  } catch (error) {
    throw new Error(error);
  }
});

router.delete("/tasks", async (req, res) => {
  try {
    const modelInstance = await main("tasks", taskSchema);
    const result = await modelInstance.findOneAndDelete(req.body);
    !result ? new Error() : res.status(201).send(result);
  } catch (error) {
    res.status(404).send(error);
    throw new Error(error);
  }
});

module.exports = router;