//let dateFns = require("date-fns");
//import { format, compareAsc } from "date-fns";

//format(new Date(2014, 1, 11), "MM/dd/yyyy");

let express = require("express");
let app = express();

app.use(express.json());

let sqlite = require("sqlite");
let sqlite3 = require("sqlite3");

let path = require("path");
let dbPath = path.join(__dirname, "todoApplication.db");

let { open } = sqlite;

//intializeDBAndServer
let db;
let intializeDBAndServer = async () => {
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  app.listen(3000, () => {
    console.log("Server Started at: http://localhost:3000/");
  });
};
intializeDBAndServer();
//API-1 GET
app.get("/todos/", async (request, response) => {
  try {
    let {
      id,
      todo,
      priority,
      status,
      category,
      due_date,
      search_q = "",
    } = request.query;

    let dateBaseQuery = "";
    switch (true) {
      case request.query.status !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    status = '${status}';    
        `;
        break;
      case request.query.priority !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    priority = '${priority}';    
        `;

        break;
      case request.query.priority !== undefined &&
        request.query.status !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    priority = '${priority}'
                    AND 
                    status = '${status}';    
        `;

        break;
      case request.query.search_q !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    todo LIKE '${search_q}';    
        `;

        break;

      case request.query.category !== undefined &&
        request.query.status !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    category = '${category}'
                    AND 
                    status = '${status}';    
        `;

        break;
      case request.query.category !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    category = '${category}';    
        `;

        break;
      case request.query.category !== undefined &&
        request.query.priority !== undefined:
        dateBaseQuery = `
                SELECT 
                *
                FROM 
                    todo
                WHERE 
                    category = '${category}'
                    AND 
                    priority = '${priority}';  
        `;

        break;
    }
    let objectsArray = await db.all(dateBaseQuery);

    let s = objectsArray.map((object) => {
      let w = {
        id: object.id,
        todo: object.todo,
        priority: object.priority,
        status: object.status,
        category: object.category,
        dueDate: object.due_date,
      };
      return w;
    });

    response.send(s);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//API-2 GET

app.get("/todos/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let sqlQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
    let object = await db.get(sqlQuery);

    let w = {
      id: object.id,
      todo: object.todo,
      priority: object.priority,
      status: object.status,
      category: object.category,
      dueDate: object.due_date,
    };

    response.send(w);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//API-3 GET

app.get("/agenda/", async (request, response) => {
  let { date } = request.query;

  let getSqlQuery = `SELECT * FROM todo WHERE due_date = '${date}';`;

  let objectsArray = await db.all(getSqlQuery);

  let s = objectsArray.map((object) => {
    let w = {
      id: object.id,
      todo: object.todo,
      priority: object.priority,
      status: object.status,
      category: object.category,
      dueDate: object.due_date,
    };
    return w;
  });
  response.send(s);
});

//API-4 POST

app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;

  let postSqlQuery = `
                INSERT INTO 
                  todo 
                    (id, todo, priority, status, category, due_date)
                VALUES 
                    ('${id}', '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');        
  `;
  await db.run(postSqlQuery);
  response.send("Todo Successfully Added");
});
