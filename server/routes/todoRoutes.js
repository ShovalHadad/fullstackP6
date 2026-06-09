const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

/*
GET /todos?userId=...
GET /todos?userId=...&fromDate=2026-06-01&toDate=2026-06-30
GET /todos?userId=...&completed=true
מחזיר את כל המטלות של משתמש מסוים.
תומך בסינון לפי טווח תאריכים וסטטוס הושלם.
Returns todos of a specific user.
Supports filtering by date range and completed status.
*/
router.get("/", async (req, res) => {
  try {
    const { userId, fromDate, toDate, completed } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const filter = {
      userId: userId
    };

    // Filter by due date range  מסנן לפי טווח תאריכים
    if (fromDate || toDate) {
      filter.dueDate = {};

      if (fromDate) {
        filter.dueDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.dueDate.$lte = new Date(toDate);
      }
    }

    // Filter by completed true/false  מסנן לפי סטטוס הושלם
    if (completed === "true" || completed === "false") {
      filter.completed = completed === "true";
    }

    const todos = await Todo.find(filter).sort({
      dueDate: 1,
      createdAt: 1
    });

    res.json(todos);
  } catch (error) {
    console.error("Get todos error:", error.message);

    res.status(500).json({
      message: "Server error while getting todos"
    });
  }
});

/*
GET /todos/:id
מחזיר מטלה אחת לפי id.
Returns one todo by id.
*/
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.json(todo);
  } catch (error) {
    console.error("Get todo error:", error.message);

    res.status(500).json({
      message: "Server error while getting todo"
    });
  }
});

/*
POST /todos
יוצר מטלה חדשה.
Creates a new todo.
Body:
{
  "userId": "...",
  "title": "Submit homework",
  "description": "Finish exercise 3",
  "dueDate": "2026-06-20"
}
*/
router.post("/", async (req, res) => {
  try {
    const { userId, title, description, dueDate } = req.body;

    if (!userId || !title) {
      return res.status(400).json({
        message: "userId and title are required"
      });
    }

    const newTodo = await Todo.create({
      userId,
      title,
      description,
      dueDate,
      completed: false
    });

    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Create todo error:", error.message);

    res.status(500).json({
      message: "Server error while creating todo"
    });
  }
});

/*
PUT /todos/:id
מעדכן מטלה.
משתמש יכול לעדכן רק את המטלה שלו.
Updates a todo.
User can update only his own todo.
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, description, dueDate, completed } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const todo = await Todo.findOne({
      _id: id,
      userId: userId
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found or not yours"
      });
    }

    if (title !== undefined) {
      todo.title = title;
    }

    if (description !== undefined) {
      todo.description = description;
    }

    if (dueDate !== undefined) {
      todo.dueDate = dueDate;
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    const updatedTodo = await todo.save();

    res.json(updatedTodo);
  } catch (error) {
    console.error("Update todo error:", error.message);

    res.status(500).json({
      message: "Server error while updating todo"
    });
  }
});

/*
DELETE /todos/:id?userId=...
מוחק מטלה.
משתמש יכול למחוק רק את המטלה שלו.
Deletes a todo.
User can delete only his own todo.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const deletedTodo = await Todo.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found or not yours"
      });
    }

    res.json({
      message: "Todo deleted successfully",
      deletedTodo
    });
  } catch (error) {
    console.error("Delete todo error:", error.message);

    res.status(500).json({
      message: "Server error while deleting todo"
    });
  }
});

module.exports = router;